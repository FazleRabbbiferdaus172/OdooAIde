import { useContext } from "react";
import { Stack } from "@mui/material";
import { Chip } from "@mui/material";

import { SelectableCodeContext } from "@/sidepanel/App";
import { SelectedCodeContext } from "@/sidepanel/App";

export default function ContextBox(props) {
    const allCodeContext = useContext(SelectableCodeContext);
    const { userSelectedCodeContext, setUserSelectedCodeContext } = useContext(SelectedCodeContext);

    let chipCodeContextList = allCodeContext.map((codeContext, index) =>
        <Chip
            key={index}
            color={userSelectedCodeContext.includes(index) ? "primary" : "default"}
            label={codeContext.slice(0, 12) + (codeContext.length > 12 ? "..." : "arc")}
            size="small"
            onClick={() => { handleClick(index) }}
            onDelete={() => { handleDelete(index) }}
        />
    );

    function handleClick(index) {
        if (!userSelectedCodeContext.includes(index)) {
            setUserSelectedCodeContext([index]);
        }
    }

    function handleDelete(index) {
        setUserSelectedCodeContext(userSelectedCodeContext.filter((item, idx) => idx !== index));
    }

    return (
        <Stack direction="row" spacing={1}>
            {chipCodeContextList}
        </Stack>
    )
}