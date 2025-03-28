"use client";

// React imports
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// VAPI SDK imports
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";

// Constants imports
import { interviewer } from "@/constants";

// Actions imports
import { createFeedback } from "@/lib/actions/feedback.action";
import { toast } from "sonner";

// enum CallStatus
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  PROCESSING = "PROCESSING",
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
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastThreeMessages, setLastThreeMessages] = useState<SavedMessage[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [animatedDots, setAnimatedDots] = useState(".");

  // Animated dots effect
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
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setIsLoading(false);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      setIsLoading(false);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => {
          const updatedMessages = [...prev, newMessage];

          // Update last three messages
          const slicedMessages = updatedMessages.slice(-3);
          setLastThreeMessages(slicedMessages);

          return updatedMessages;
        });
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
    };

    // Add event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // Cleanup
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  // useEffect hook that will execute when something changes Feedback generation useEffect
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        const handleGenerateFeedback = async (messages: SavedMessage[]) => {
          try {
            setCallStatus(CallStatus.PROCESSING);
            setIsLoading(true);

            toast.info("Analyzing interview", {
              description: "Please wait while we process your interview...",
              duration: 3000,
            });

            const result = await createFeedback({
              interviewId: interviewId!,
              userId: userId!,
              transcript: messages,
              feedbackId,
            });

            if (result.success && result.feedbackId) {
              toast.success("Interview processed successfully!", {
                description: "Redirecting to feedback...",
                duration: 2000,
              });
              setTimeout(
                () => router.push(`/interview/${interviewId}/feedback`),
                2000
              );
            } else {
              toast.error("Error processing interview", {
                description: result.error || "Please try again later",
              });
              router.push("/");
            }
          } catch (error) {
            console.error("Feedback generation error:", error);
            toast.error("Unexpected error", {
              description: "Failed to process interview",
            });
            router.push("/");
          } finally {
            setIsLoading(false);
          }
        };

        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  // Function to handle call start
  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      setIsLoading(true);

      toast.info("Starting call", {
        description: "Please wait while we connect...",
        duration: 2000,
      });

      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
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
      toast.error("Call Start Failed", {
        description: "Unable to start the call. Please try again.",
      });
      setCallStatus(CallStatus.INACTIVE);
      setIsLoading(false);
    }
  };

  // Function to handle disconnect call
  const handleDisconnect = () => {
    try {
      // Set status to finished
      setCallStatus(CallStatus.FINISHED);

      // Explicitly stop the call
      vapi.stop();

      // Show a toast notification
      toast.info("Call Ended", {
        description: "The call has been disconnected.",
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Disconnect Failed", {
        description: "Unable to end the call. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if component should be disabled
  const isDisabled =
    isLoading ||
    callStatus === CallStatus.CONNECTING ||
    callStatus === CallStatus.PROCESSING;

  return (
    <>
      <div
        className={cn(
          "call-view",
          isDisabled && "opacity-50 pointer-events-none"
        )}
      >
        {/* AI Interviewer Card */}
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
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto -my-4">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-1 rounded-xl shadow-md">
          <div className="bg-white dark:bg-gray-950 rounded-lg p-4 space-y-4">
            {lastThreeMessages.length > 0 ? (
              lastThreeMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "transition-all duration-300 animate-fadeIn opacity-100 p-3 rounded-lg max-w-[85%]",
                    msg.role === "user"
                      ? "ml-auto bg-purple-100 dark:bg-purple-900/30 text-gray-800 dark:text-gray-200"
                      : "bg-indigo-50 dark:bg-indigo-950/40 text-gray-800 dark:text-gray-200"
                  )}
                >
                  <div className="font-medium text-xs mb-1 text-gray-500 dark:text-gray-400">
                    {msg.role === "user" ? userName : "AI Interviewer"}
                  </div>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm italic">
                No messages yet. Start the call to begin the interview.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call"
            onClick={handleCall}
            disabled={isDisabled}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span>
              {callStatus === CallStatus.INACTIVE ||
              callStatus === CallStatus.FINISHED
                ? "Start Call"
                : isLoading
                ? `${animatedDots}`
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
