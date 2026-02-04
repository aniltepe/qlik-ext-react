import { TextField } from '@mui/material';

const CustomText = (props) => {
    return (
        <TextField 
            disabled={props.disabled}
            required={props.required}
            key={props.k}
            fullWidth 
            size="small" 
            variant="standard" 
            value={props.value} 
            label={props.label}
            slotProps={{inputLabel: {sx: {fontSize: "14px"}}}}
            onChange={(evt) => props.onChange(evt, props.k)}
            error={props.error.err}
            helperText={props.error.htxt}
        />
    );
};

export default CustomText;