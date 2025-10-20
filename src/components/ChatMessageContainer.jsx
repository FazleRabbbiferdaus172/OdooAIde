import List from '@mui/material/List';
import ChatMessageBox from './ChatMessageBox';


export default function ChatMessageContainer(props) {
    const messages = props.messages.map(message => <ChatMessageBox message={message.message} messageClass={message.messageClass}/>)
    return (
        <List className="chat-message-list">
            {messages}
            <div ref={props.lastMessageRef}/>
        </List>
    );
}