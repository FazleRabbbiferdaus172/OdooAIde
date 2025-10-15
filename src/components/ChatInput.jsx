import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { Paper } from '@mui/material';

export default function ChatInput(props) {
    // debugger;
    console.log("ChatInput props:", props);
    return (
        <Paper component="form" className="input-area" elevation={3}>
            <TextField
                fullWidth
                variant="standard"
                placeholder="Ask something..."
                InputProps={{ disableUnderline: true }}
                value={props.userMessageInput}
                onChange={(e) => props.setUserMessageInput(e.target.value)}
            />
            <IconButton color="primary" aria-label="send message" onClick={() => props.messagesUpdate()}>
                <SendIcon />
            </IconButton>
        </Paper>
    )
}