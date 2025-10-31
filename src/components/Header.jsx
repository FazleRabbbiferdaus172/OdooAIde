import { Button, Box, Tooltip } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import CodeIcon from '@mui/icons-material/Code';

function _goToViewCode() {
  try {
    const debugButton = document.querySelector('.o_debug_manager .dropdown-toggle');
    if (!debugButton) {
      alert('OdooAide: Developer Mode is not active.');
      return;
    }
    debugButton.click();

    setTimeout(() => {
      try {
        const items = Array.from(document.querySelectorAll('span[role="menuitem"]'));
        console.log('OdooAide: Found debug modal items:', items);
        const viewLink = items.find(item => {
          const text = item.innerText.trim();
          return text.startsWith('View:') && !text.startsWith('SearchView');
        });
        
        if (viewLink) {
          viewLink.click();
        } else {
          alert('OdooAide: Could not find the "View: ..." link in the debug modal.');
          debugButton.click();
        }
      } catch (e) {
        alert(`OdooAide: Error finding View link: ${e.message}`);
      }
    }, 100);
  } catch (e) {
    alert(`OdooAide: Error clicking debug menu: ${e.message}`);
  }
}

const Header = () => {

  const onToggleDevMode = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          let url = new URL(window.location.href);
          if (url.searchParams.has('debug')) {
            url.searchParams.delete('debug');
          } else {
            url.searchParams.set('debug', '1');
          }
          window.location.href = url.toString();
        }
      });
    } catch (error) {
      console.error("Error toggling dev mode:", error);
    }
  };

  const onGoToViewCode = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: _goToViewCode
      });
    } catch (error) {
      console.error("Error executing go-to-view script:", error);
    }
  };

  return (
    <Box 
      sx={{ 
        p: 1, 
        display: 'flex', 
        gap: 1, 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Tooltip title="Toggle Odoo Developer Mode (Reloads page)">
        <Button 
          variant="outlined" 
          size="small" 
          onClick={onToggleDevMode}
          sx={{ minWidth: '40px' }}
        >
          <BugReportIcon fontSize="small" />
        </Button>
      </Tooltip>
      <Tooltip title="Go to 'Edit View' Code">
        <Button 
          variant="outlined" 
          size="small" 
          onClick={onGoToViewCode}
          sx={{ minWidth: '40px' }}
        >
          <CodeIcon fontSize="small" />
        </Button>
      </Tooltip>
    </Box>
  );
};

export default Header;