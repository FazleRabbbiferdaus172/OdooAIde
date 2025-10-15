import List from '@mui/material/List';
import ChatMessageBox from './ChatMessageBox';


export default function ChatMessageContainer(props) {
    const messages = props.messages.map(message => <ChatMessageBox message={message.message} messageClass={message.messageClass} />)
    return (
        <div style={{ overflowY: 'auto'}}>
            <List className="message-list">
                {messages}
            </List>
            <div ref={props.lastMessageRef}/>
        </div>
    );
}