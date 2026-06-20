import ChatPanel from "@/components/chatbot/ChatPanel"

export default function Chatbot() {
  return (
    <div className="h-screen bg-[#08101f]">
      <div className="flex h-full w-full items-stretch justify-center">
        <div className="w-full h-full">
          <ChatPanel />
        </div>
      </div>
    </div>
  )
}
