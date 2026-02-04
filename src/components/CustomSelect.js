import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const CustomSelect = (props) => {
    return (
        <FormControl fullWidth required={props.required} disabled={props.disabled}>
            <InputLabel 
                className='custom-select-label'
                error={props.error.err} 
                // sx={{fontSize: "14px", transform: "translate(0px, 17px) scale(1)", "& .MuiInputLabel-shrink": {transform: "translate(0px, 3px) scale(0.75)"}}} 
                sx={{fontSize: "14px"}}
                id={props.k + "_label"}
            >
                {props.label}
            </InputLabel>
            <Select
                key={props.k}
                fullWidth 
                size="small" 
                variant="standard" 
                value={props.value}
                label={props.label}
                labelId={props.k + "_label"}
                onChange={(evt) => props.onChange(evt, props.k)}
                error={props.error.err}                
            >
                {props.enums.map((val) => 
                    <MenuItem key={val[1]} value={val[1]}>{val[0]}</MenuItem>
                )}
            </Select>
            {props.error.htxt !== "" && (
                <FormHelperText error={props.error.err} size="small" sx={{marginLeft: 0, marginRight: 0}}>{props.error.htxt}</FormHelperText>
            )}
        </FormControl>
    );
};

export default CustomSelect;