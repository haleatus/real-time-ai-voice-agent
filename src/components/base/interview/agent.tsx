/* eslint-disable react-hooks/exhaustive-deps */
"use client";

// React imports
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// VAPI SDK imports
import { vapi } from "@/lib/vapi.sdk";

// AgentProps interface
interface AgentProps {
  userName?: string;
  userId?: string;
  type: string;
}

// enum CallStatus
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
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
 * @returns Agent component
 */
const Agent = ({ userName, userId, type }: AgentProps) => {
  const router = useRouter();

  // State variables for checking call status, speaking status, and messages
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  // useEffect hook to handle event listeners
  useEffect(() => {
    // Event listeners
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) =>
      console.error("Error in agent component", error);

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
    // If call status is finished, redirect to home page
    if (callStatus === CallStatus.FINISHED) router.push("/");
  }, [messages, callStatus, type, userId]);

  // Function to handle call start
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
      variableValues: {
        username: userName,
        userid: userId,
      },
    });
  };

  // Function to handle disconnect call
  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    await vapi.stop();
  };

  // Get the latest message
  const latestMessage = messages[messages.length - 1]?.content;

  // Check if call is inactive or finished
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="vapi"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
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
              key={latestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75 ",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span>{isCallInactiveOrFinished ? "Call" : "..."}</span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
