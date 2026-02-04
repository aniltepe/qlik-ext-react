import { useState, useContext, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, 
    IconButton, FormControlLabel, Checkbox } from '@mui/material';
import { CustomSelect } from '../components';
import { AppContext, DataContext } from '../contexts';
import { Close } from '@mui/icons-material';

const File = (props) => {
    const {setDialog, file} = useContext(AppContext);
    const {cols, setPreRows} = useContext(DataContext);
    const [includeHeader, setIncludeHeader] = useState(true);
    const [mapping, setMapping] = useState(cols.map((c) => c.fieldname).reduce((o, key) => ({...o, [key]: ""}), {}));
    const [requireds, setRequireds] = useState(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: cols[i].fieldrequired}), {}));
    const [errors, setErrors] = useState(cols.map((c) => c.fieldname).reduce((o, key) => ({...o, [key]: {err: false, htxt: ""}}), {}));
    const [headers, setHeaders] = useState([]);

    useEffect(() => {
        if (includeHeader) {
            setHeaders(file.rows[0].map((val, idx) => [val, idx]))
        }
        else {
            setHeaders(Array.from(Array(file.rows[0].length).keys()).map((idx) => [`Sütun_${idx}`, idx]))
        }
        setMapping(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: i < file.rows[0].length ? i : ""}), {}))
    }, [file.rows, includeHeader]);

    // useEffect(() => {
    //     let newMapping = {};
    //     let newErrors = {};
    //     for (let i = 0; i < cols.length; i++) {
    //         newMapping[cols[i].fieldname] = i;
    //         newErrors[cols[i].fieldname] = {err: false, htxt: ""};
    //     }
    //     setMapping(newMapping);
    //     setErrors(newErrors);
    //     setDefaultErrors(newErrors);
    // }, [cols]);

    const validate = () => {        
        // let newErrors = structuredClone(defaultErrors);
        let errors = {};
        let valid = true;
        for (let i = 0; i < Object.keys(mapping).length; i++) {
            let f = Object.keys(mapping)[i];
            errors[f] = {err: false, htxt: ""}
            if (mapping[f] === "" && requireds[f]) {
                errors[f] = {err: true, htxt: "Bu alan zorunlu olduğu için sütun seçilmelidir."};
                valid = false;
            }
        }
        return [valid, errors];
    }

    const handleApply = () => {
        const [isValid, errors] = validate();
        setErrors(errors);
        if (!isValid) {
            return;
        } 
        // console.log("handleApply")
        let newRows = [];
        for (let i = 0; i < file.rows.length; i++) {
            if (includeHeader && i === 0) {
                continue;
            }
            let newRow = {};
            for (let j = 0; j < cols.length; j++) {
                newRow[cols[j].fieldname] = file.rows[i][mapping[cols[j].fieldname]]
            }
            // let row = props.construct(newRow);
            newRows.push(newRow);
        }
        newRows = props.tweak(newRows);
        setPreRows((rows) => [...rows, ...newRows]);
        setDialog("");
    };

    const handleChange = (evt, key) => {
        setMapping({...mapping, [key]: evt.target.value});
    };

    return (
        <Dialog open fullWidth>
            <DialogTitle sx={{display: "flex", padding: "0", justifyContent: "end"}}>
                <IconButton onClick={() => setDialog("")}>
                    <Close />
                </IconButton>
            </DialogTitle >
            <DialogTitle sx={{paddingTop: "0"}}>
                <Typography fontWeight="bold">{file.name}</Typography>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>                            
                    <FormControlLabel 
                        label="Başlık satırı içeriyor" 
                        control={<Checkbox checked={includeHeader} onChange={() => setIncludeHeader(!includeHeader)} />} />
                    <Typography>{`Satır sayısı: ${file.rows.length - (includeHeader ? 1 : 0)}`}</Typography>
                </div>                        
            </DialogTitle>
            <DialogContent sx={{display: "flex", flexFlow: "column", justifyContent: "space-around", gap: "10px", position: "relative"}}>
                {cols.map((val, idx) => {
                    if (mapping) {
                        return (
                            <CustomSelect 
                                key={val.fieldname}
                                k={val.fieldname} 
                                onChange={handleChange} 
                                value={mapping[val.fieldname]} 
                                label={val.fieldheader}
                                enums={[...headers, ...[["BOŞ", ""]]]}  
                                required={false} 
                                disabled={false}
                                error={errors[val.fieldname]} />
                        )
                    }
                    else {
                        return null;
                    }
                })}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleApply}>
                    <Typography>Yükle</Typography>
                </Button>
            </DialogActions> 
        </Dialog>
    );
};

export default File;