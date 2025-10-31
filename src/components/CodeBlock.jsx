import { useState, useContext } from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Highlight, themes } from "prism-react-renderer";
import Button from '@mui/material/Button';
import ReactDiffViewer from 'react-diff-viewer';
import { SelectableCodeContext } from "@/sidepanel/App";
import { SelectedCodeContext } from "@/sidepanel/App";


const CodeBlock = ({ language, code }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const allCodeContext = useContext(SelectableCodeContext);
  const { userSelectedCodeContext, setUserSelectedCodeContext } = useContext(SelectedCodeContext);

  function getCodeContextForPrompt() {
    // Get code context based on user selection
    return userSelectedCodeContext.length > 0 ? allCodeContext[userSelectedCodeContext[0]] : false;
  }

  // todo: move to util, and import here
  async function getTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleApply = async () => {
    console.log("Attempting to apply code...");

    try {
      const tab = await getTab();
      if (!tab || !tab.id) {
        console.error("No active tab found.");
        return;
      }

      const injectionFunction = (newCode) => {
        try {
          const codeEditorElement = document.querySelector('.ace_content');
          if (!codeEditorElement) {
            console.error("OdooAide: Could not find Ace editor element.");
            return;
          }

          const editor = ace.edit(codeEditorElement.parentElement.parentElement);
          editor.setValue(newCode, 1);

        } catch (error) {
          console.error("OdooAide: Error applying code to Ace editor:", error);
        }
      };

      // 3. Execute the script in the MAIN world
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: injectionFunction,
        args: [code] // This passes 'codeToApply' as the 'newCode' argument
      });

    } catch (error) {
      console.error("Error sending apply command:", error);
    }
  };

  const toggleDiff = () => {
    setShowDiff(prev => !prev);
  };

  // Map 'python' to 'py' and 'xml' to 'markup' as required by prism
  const prismLanguage = language === 'python' ? 'py' : (language === 'xml' ? 'markup' : 'clike');
  const safeOriginalCode = getCodeContextForPrompt() || "";

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
        <Box>
          <Button
            size="small"
            onClick={toggleDiff}
            sx={{ color: '#f1f1f1', mr: 1, fontSize: '0.75rem' }}
          >
            {showDiff ? "Hide Diff" : "Show Diff"}
          </Button>
          <Button size="small" onClick={handleApply}>Apply</Button>
          <IconButton onClick={handleCopy} size="small" color="inherit">
            {isCopied ?
              <DoneAllIcon fontSize="small" sx={{ color: 'lightgreen' }} /> :
              <CopyAllIcon fontSize="small" />
            }
          </IconButton>
        </Box>
      </Box>

      {/* 2. The Code Highlighter */}

      {
        showDiff ?
          (
            <ReactDiffViewer
              oldValue={safeOriginalCode}
              newValue={code}
              splitView={false}
              useDarkTheme={true}
              styles={{
                variables: {
                  dark: {
                    diffViewerBackground: '#2d2d2d',
                    codeFoldBackground: '#2d2d2d',
                    gutterBackground: '#3a3a3a',
                    addedBackground: '#044B53',
                    removedBackground: '#632F34'
                  }
                },
                diffContainer: { margin: 0, borderRadius: '0 0 8px 8px' },
                gutter: { minWidth: '30px' },
                codeFold: {
                  backgroundColor: '#2d2d2d',
                }
              }}
              compareMethod="diffChars"
            />
          )
          : <Highlight
            theme={themes.dracula}
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
      }
    </Paper>
  );
};

export default CodeBlock;