import { Paper } from '@mui/material';
import ListItem from '@mui/material/ListItem';

export default function ChatMessageBox(props) {
    return (
        <ListItem sx={props.messageClass === "received" ? { justifyContent: 'flex-start' } : { justifyContent: 'flex-end' }}>
            <Paper className={"message " + props.messageClass}>
                {props.message}
            </Paper>
        </ListItem>
    );
}