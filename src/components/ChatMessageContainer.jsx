import List from '@mui/material/List';
import ChatMessageBox from './ChatMessageBox';


export default function ChatMessageContainer(props) {
    const messages = props.messages.map((message, index) => <ChatMessageBox key={index} message={message.message} messageClass={message.messageClass} isLastMessage={index === props.messages.length - 1}/>)
    return (
        <List className="chat-message-list">
            {messages}
            <div ref={props.lastMessageRef}/>
        </List>
    );
}