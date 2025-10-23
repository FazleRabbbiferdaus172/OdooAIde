import { Paper } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import CodeBlock from './CodeBlock';



function sentMessage(message) {
    return (
        <ListItem sx={{ justifyContent: 'flex-end' }}>
            <Paper className={"message sent"}>
                {message}
            </Paper>
        </ListItem>
    );
}

function receivedMessage(message) {
    try {
        const parsedMessage = JSON.parse(message);
        let codeBlockElements = null; // Use 'let' and a clearer variable name

        // 1. Check for 'codeBlocks' (plural)
        if (parsedMessage.codeBlocks && parsedMessage.codeBlocks.length > 0) {

            // 2. Map over 'codeBlocks' (plural)
            codeBlockElements = parsedMessage.codeBlocks.map((codeItem, index) => (
                <CodeBlock key={index} code={codeItem.code} language={codeItem.language} />
            ));
        }
        return (
            <ListItem sx={{ justifyContent: 'flex-start' }}>
                <Paper className={"message received"}>
                    {parsedMessage.explanation}
                    {
                        codeBlockElements
                    }
                </Paper>
            </ListItem>
        );
    } catch (error) {
        return (
            <ListItem sx={{ justifyContent: 'flex-start' }}>
                <Paper className={"message received"}>
                    {message}
                </Paper>
            </ListItem>
        );
    }
}


export default function ChatMessageBox(props) {
    const message = props.message;
    const renderedMessage = props.messageClass === "sent" ? sentMessage(message) : receivedMessage(message);
    return renderedMessage;
}