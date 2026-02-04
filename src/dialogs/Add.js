import { useState, Fragment, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, Button, Typography, DialogTitle, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { CustomText, CustomSelect, CustomRadio, CustomDate, CustomDatetime, FieldType } from '../components';
import { AppContext, DataContext } from '../contexts';

const Add = (props) => {
    const {setDialog} = useContext(AppContext);
    const {cols, setRows} = useContext(DataContext);
    const [values, setValues] = useState(cols.map((c) => c.fieldname).reduce((o, key) => ({...o, [key]: ""}), {}));
    const [labels, setLabels] = useState(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: cols[i].fieldheader}), {}));
    const [types, setTypes] = useState(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: cols[i].fieldtype}), {}));
    const [requireds, setRequireds] = useState(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: cols[i].fieldrequired}), {}));
    const [enums, setEnums] = useState(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: cols[i].fieldenum}), {}));
    const [formats, setFormats] = useState(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: cols[i].fieldformat}), {}));
    const [errors, setErrors] = useState(cols.map((c) => c.fieldname).reduce((o, key) => ({...o, [key]: {err: false, htxt: ""}}), {}));

    const handleApply = () => {     
        // const isValid = validate();
        const [isValid, newErrors] = props.validate(values);
        setErrors(newErrors);
        if (!isValid) {
            return;
        }
        let row = props.construct(values);
        setRows((rows) => [...rows, row]);
        setDialog("");
    };
    
    const handleChange = (evt, key) => {
        setValues({...values, [key]: evt.target.value});
    };

    return (
        <Dialog open fullWidth>            
            <DialogTitle sx={{display: "flex", padding: "0", justifyContent: "end"}}>
                <IconButton onClick={() => setDialog("")}>
                    <Close />
                </IconButton>
            </DialogTitle >
            <DialogContent sx={{display: "flex", flexFlow: "column", justifyContent: "space-around", gap: "10px", position: "relative"}}>
                {Object.entries(values).map(([k, _]) => 
                    <Fragment key={k}>
                        {(types[k] === FieldType.STRING || types[k] === FieldType.INTEGER || types[k] === FieldType.FLOAT) && (
                            <CustomText 
                                k={k} 
                                key={k} 
                                onChange={handleChange} 
                                value={values[k]} 
                                label={labels[k]}
                                required={requireds[k]}
                                error={errors[k]} />
                        )}
                        {types[k] === FieldType.MENU && (
                            <CustomSelect 
                                k={k} 
                                key={k} 
                                onChange={handleChange} 
                                value={values[k]} 
                                label={labels[k]} 
                                enums={enums[k].split(";").map((val) => [val.split(",")[0], val.split(",")[1]])} 
                                required={requireds[k]}
                                error={errors[k]} />
                        )}
                        {types[k] === FieldType.BOOLEAN && (
                            <CustomRadio 
                                k={k} 
                                key={k} 
                                onChange={handleChange} 
                                value={values[k]} 
                                label={labels[k]}
                                required={requireds[k]}
                                error={errors[k]}/>
                        )}
                        {types[k] === FieldType.DATE && (
                            <CustomDate 
                                k={k} 
                                key={k} 
                                onChange={handleChange} 
                                value={values[k]} 
                                label={labels[k]}
                                format={formats[k]}
                                required={requireds[k]}
                                error={errors[k]} />
                        )}
                        {types[k] === FieldType.DATETIME && (
                            <CustomDatetime 
                                k={k} 
                                key={k} 
                                onChange={handleChange} 
                                value={values[k]} 
                                label={labels[k]}
                                format={formats[k]}
                                required={requireds[k]}
                                // disabled={allDisabled}
                                error={errors[k]} />
                        )}
                    </Fragment> 
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleApply}>
                    <Typography>Ekle</Typography>
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default Add;