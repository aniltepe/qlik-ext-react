import { Fragment } from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@mui/material';

const CustomRadio = (props) => {
    return (
        <>
            <FormControl className='custom-radio-form' fullWidth disabled={props.disabled}
                sx={{flexDirection: "row", alignItems: "center", minHeight: "45px", boxSizing: "border-box",
                    borderBottom: props.error.err ? "1px solid #d32f2f" : "1px " + (props.disabled ? "dotted" : "solid" ) + " rgba(0, 0, 0, 0.42)"
                }}
            >
                <FormLabel error={props.error.err} sx={{fontSize: "14px", marginRight: "20px", top: "3px", minWidth: "200px"}} id={props.k + "_label"}>
                    {props.label + (props.required ? " *" : "")}
                </FormLabel>
                <RadioGroup
                    row sx={{marginTop: "5px"}}
                    key={props.k}
                    size="small" 
                    value={props.value}
                    onChange={(evt) => props.onChange({target: {value: evt.target.value === "true" ? true : false}}, props.k)}
                >
                    <FormControlLabel value={true} control={<Radio size='small'/>} label="Evet" />
                    <FormControlLabel value={false} control={<Radio size='small'/>} label="Hayır" />
                </RadioGroup>
            </FormControl>
            <FormHelperText error={props.error.err} size="small" sx={{marginLeft: 0, marginRight: 0, marginTop: "-6px"}}>{props.error.htxt}</FormHelperText>
        </>
    );
};

export default CustomRadio;