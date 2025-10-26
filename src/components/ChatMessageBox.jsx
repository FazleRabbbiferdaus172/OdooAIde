import { useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { Paper } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import CodeBlock from './CodeBlock';
import AnimatedCursor from './AnimatedCursor';
import { IsWaitingContext } from '@/sidepanel/App'

const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        const lang = match ? match[1] : 'text';

        return !inline ? (
            <CodeBlock
                code={String(children).replace(/\n$/, '')}
                language={lang}
            />
        ) : (

            <code className={className} {...props}>
                {children}
            </code>
        );
    }
};

function sentMessage(message) {
    return (
        <ListItem sx={{ justifyContent: 'flex-end' }}>
            <Paper className={"message sent"}>
                {message}
            </Paper>
        </ListItem>
    );
}

function receivedMessage(message, isInProgress) {
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
                    <ReactMarkdown
                        children={message || ""}
                        rehypePlugins={[rehypeSanitize]} // Sanitize HTML
                        components={markdownComponents}  // Use custom CodeBlock
                    />
                    {isInProgress ? <AnimatedCursor /> : null}
                </Paper>
            </ListItem>
        );
    }
}


export default function ChatMessageBox(props) {
    const message = props.message;
    const isWaitingForAi = useContext(IsWaitingContext)
    const isInProgress = props.messageClass === "received" && isWaitingForAi && props.isLastMessage;
    const renderedMessage = props.messageClass === "sent" ? sentMessage(message) : receivedMessage(message, isInProgress);
    return renderedMessage;
}