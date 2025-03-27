"use client";

// React imports
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { interviewer } from "@/constants";

// Actions imports
import { createFeedback } from "@/lib/actions/feedback.action";

// VAPI SDK imports
import { vapi } from "@/lib/vapi.sdk";
import { toast } from "sonner";

// enum CallStatus
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  ANALYZING = "ANALYZING",
}

// SavedMessage interface
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

/**
 * Agent component
 * @param userName
 * @param userId
 * @param type
 * @param interviewId
 * @param feedbackId
 * @param questions
 * @returns Agent component
 */
const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();

  // State variables for checking call status, speaking status, and messages
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [lastMessage, setLastMessage] = useState<string>("");
  const [animatedDots, setAnimatedDots] = useState(".");

  const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!;

  // Animate dots effect
  useEffect(() => {
    let isMounted = true;
    if (isLoading) {
      const interval = setInterval(() => {
        if (isMounted) {
          setAnimatedDots((prev) => (prev.length >= 3 ? "." : prev + "."));
        }
      }, 500);

      return () => {
        clearInterval(interval);
        isMounted = false;
      };
    }
  }, [isLoading]);

  // useEffect hook to handle event listeners
  useEffect(() => {
    // Event listeners
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setIsLoading(false);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
      setIsLoading(false);
      toast.error("Call initialization failed", {
        description: error.message,
      });
    };

    // Add event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // Cleanup so we don't have multiple listeners
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  // useEffect hook that will execute when some thing changes
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    // Function to handle generating feedback
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");
      setCallStatus(CallStatus.ANALYZING);
      setIsLoading(true);

      toast.info("Analyzing interview", {
        description: "Please wait while we process your interview...",
        duration: 3000,
      });

      try {
        const { success, feedbackId: id } = await createFeedback({
          interviewId: interviewId!,
          userId: userId!,
          transcript: messages,
          feedbackId,
        });

        if (success && id) {
          toast.success("Interview processed successfully!", {
            description: "Redirecting to feedback...",
            duration: 2000,
          });
          setTimeout(
            () => router.push(`/interview/${interviewId}/feedback`),
            2000
          );
        } else {
          throw new Error("Feedback creation failed");
        }
      } catch (error) {
        console.log("Error:", error);
        toast.error("Error processing interview", {
          description: "Redirecting to home...",
          duration: 2000,
        });
        setTimeout(() => router.push("/"), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        toast.info("Call ended", {
          description: "Redirecting to home...",
          duration: 2000,
        });
        setTimeout(() => router.push("/"), 2000);
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  // Function to handle call start
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    setIsLoading(true);

    toast.info("Starting call", {
      description: "Please wait while we connect...",
      duration: 2000,
    });

    try {
      if (type === "generate") {
        await vapi.start(workflowId, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Call start error:", error);
      setIsLoading(false);
      toast.error("Failed to start call", {
        description: "Please try again.",
      });
    }
  };

  // Function to handle disconnect call
  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    await vapi.stop();
  };

  // Check if call is inactive or finished
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  // Determine if component should be disabled
  const isDisabled =
    isLoading ||
    callStatus === CallStatus.ANALYZING ||
    callStatus === CallStatus.CONNECTING;

  return (
    <>
      <div
        className={cn(
          "call-view",
          isDisabled && "opacity-50 pointer-events-none"
        )}
      >
        <div
          className={`card-interviewer ${
            isSpeaking
              ? "border-2 transition-all duration-300 border-purple-300/60"
              : ""
          }`}
        >
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="vapi"
              width={65}
              height={54}
              className="object-cover"
            />
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={540}
              height={540}
              className="object-cover rounded-full size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call"
            onClick={handleCall}
            disabled={isDisabled}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75 ",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span>
              {isCallInactiveOrFinished
                ? "Start Call"
                : isLoading
                ? `Starting${animatedDots}`
                : "..."}
            </span>
          </button>
        ) : (
          <button
            className="btn-disconnect"
            onClick={handleDisconnect}
            disabled={isDisabled}
          >
            End Call
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
