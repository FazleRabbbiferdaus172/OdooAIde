import { useContext } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Button from '@mui/material/Button';
import { Paper } from '@mui/material';
import { IsWaitingContext } from '@/sidepanel/App'

export default function ChatInput(props) {
    const isWaitingForAi = useContext(IsWaitingContext);

    function handleSubmit(e) {
        e.preventDefault();
        props.messagesUpdate();
    }

    const loadingButton = (<Button loading variant="outlined">
        Submit
    </Button>);
    const sendButton = (<IconButton color="primary" aria-label="send message" type="submit">
        <SendIcon />
    </IconButton>)
    let button = isWaitingForAi ? loadingButton : sendButton;

    return (
        <Paper component="form" onSubmit={handleSubmit} className="chat-input-box" elevation={3}>
            <div className='chat-input-area'>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="standard"
                    placeholder="Ask something..."
                    InputProps={{ disableUnderline: true }}
                    value={props.userMessageInput}
                    onChange={(e) => props.setUserMessageInput(e.target.value)}
                />
                {button}
            </div>

        </Paper>

    )
}