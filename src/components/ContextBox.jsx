import { Stack } from "@mui/material";
import { Chip } from "@mui/material";

export default function ContextBox(props) {
    function handleClick(ev) {
        console.info('You clicked the Chip.');
    }

    function handleDelete(ev) {
        console.info('You deleted the Chip.');
    }

    return (
        <Stack direction="row" spacing={1}>
          <Chip color="primary" label="Soft" size="small" onClick={handleClick} onDelete={handleDelete}/>
          <Chip label="Medium" size="small" onClick={handleClick} onDelete={handleDelete}/>
          <Chip label="Hard" size="small" onClick={handleClick} onDelete={handleDelete}/>
        </Stack>
    )
}