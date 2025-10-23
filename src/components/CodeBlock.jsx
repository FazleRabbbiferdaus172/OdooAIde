// src/components/CodeBlock.jsx

import { useState } from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Highlight, themes } from "prism-react-renderer";

// Props: language (string), code (string)
const CodeBlock = ({ language, code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // Map 'python' to 'py' and 'xml' to 'markup' as required by prism
  const prismLanguage = language === 'python' ? 'py' : (language === 'xml' ? 'markup' : 'clike');

  return (
    <Paper 
      sx={{ 
        my: 2, 
        backgroundColor: '#2d2d2d', // Based on dracula theme
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {/* 1. The Header Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#3a3a3a',
          color: '#f1f1f1',
          py: 0.5,
          px: 2,
        }}
      >
        <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
          {language}
        </Typography>
        <IconButton onClick={handleCopy} size="small" color="inherit">
          {isCopied ? 
            <DoneAllIcon fontSize="small" sx={{ color: 'lightgreen' }} /> : 
            <CopyAllIcon fontSize="small" />
          }
        </IconButton>
      </Box>

      {/* 2. The Code Highlighter */}
      <Highlight
        theme={themes.dracula} // Use a standard theme
        code={code.trim()}
        language={prismLanguage}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre 
            style={{
              ...style, 
              padding: '16px', 
              margin: 0, 
              overflow: 'auto',
              borderRadius: '0 0 8px 8px'
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </Paper>
  );
};

export default CodeBlock;