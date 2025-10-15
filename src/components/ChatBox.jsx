import Box from "@mui/material/Box";
import ChatInput from "./ChatInput";
import ChatMessageContainer from "./ChatMessageContainer";


export default function ChatBox(props) {
    // debugger;
    return (
        <Box className="chat-container">
            <ChatMessageContainer messages={props.messages} lastMessageRef={props.lastMessageRef}/>
            <ChatInput messagesUpdate={props.messagesUpdate} userMessageInput={props.userMessageInput}
                setUserMessageInput={props.setUserMessageInput} />
        </Box>
    );
}