import { useEffect, useState, Fragment, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, Button, Typography, DialogTitle, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { CustomText, CustomSelect, CustomRadio, CustomDate, CustomDatetime, FieldType } from '../components';
import { AppContext, DataContext } from '../contexts';

const Edit = (props) => {
    const {setDialog} = useContext(AppContext);
    const {cols, setRows, badRows, setBadRows, editedRows, setEditedRows, currRow, setCurrRow} = useContext(DataContext);
    const [values, setValues] = useState({});
    const [labels, setLabels] = useState(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: cols[i].fieldheader}), {}));
    const [types, setTypes] = useState(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: cols[i].fieldtype}), {}));
    const [requireds, setRequireds] = useState(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: cols[i].fieldrequired}), {}));
    const [enums, setEnums] = useState(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: cols[i].fieldenum}), {}));
    const [formats, setFormats] = useState(cols.map((c) => c.fieldname).reduce((o, key, i) => ({...o, [key]: cols[i].fieldformat}), {}));
    const [errors, setErrors] = useState(cols.map((c) => c.fieldname).reduce((o, key) => ({...o, [key]: {err: false, htxt: ""}}), {}));

    useEffect(() => {
        let newValues = cols.map((c) => c.fieldname).reduce((o, key) => ({...o, [key]: currRow[key]}), {});
        if (props.correction) {
            const [isValid, newErrors] = props.validate(newValues);
            setErrors(newErrors);
            for (let i = 0; i < Object.keys(newErrors).length; i++) {
                const key = Object.keys(newErrors)[i];
                if ((types[key] === FieldType.DATE || types[key] === FieldType.DATETIME) && newErrors[key].err) {
                    newValues = {...newValues, [key]: ""}
                }
            }
        }
        setValues(newValues);
    }, [currRow]);

    // useEffect(() => {
    //     console.log("useEffect_2")
    //     setValues(cols.map((c) => c.fieldname).reduce((o, key) => ({...o, [key]: currRow[key]}), {}));
    // }, [currRow]);

    const handleApply = () => {
        const [isValid, newErrors] = props.validate(values);
        setErrors(newErrors);
        if (!isValid) {
            return;
        }
        let row = props.construct(values); 
        if (props.correction) {
            setRows((rows) => [...rows, row]);
            if (badRows.length === 1) {
                setCurrRow(undefined);
                setBadRows(badRows.filter((val, i) => i !== 0))
                setDialog("");
            }
            else {
                setCurrRow(badRows[1])
                setBadRows(badRows.filter((val, i) => i !== 0))
            } 
        }
        else {
            const {datagrid_row_id, ...rest} = currRow;
            let noChange = true;
            for (let i = 0; i < Object.keys(rest).length; i++) {
                const key = Object.keys(rest)[i];
                if (rest[key] !== row[key]) {
                    noChange = false;
                    break;
                }
            }
            // if (JSON.stringify(rest) === JSON.stringify(row)) {
            if (noChange) {
                setDialog("");
                return;
            }
            // const existedEdit = editedRows.find((r) => JSON.stringify(r.newvalue) === JSON.stringify(rest))
            const existedEdit = editedRows.find((r) => {
                for (let i = 0; i < Object.keys(r.newvalue).length; i++) {
                    const key = Object.keys(r.newvalue)[i];
                    if (r.newvalue[key] !== rest[key]) {
                        return false;
                    }
                }
                return true;
            })
            if (existedEdit) {
                setEditedRows((rows) => rows.map((r) => {
                    let existed = true;
                    for (let i = 0; i < Object.keys(r.newvalue).length; i++) {
                        const key = Object.keys(r.newvalue)[i];
                        if (r.newvalue[key] !== rest[key]) {
                            existed = false;
                            break;
                        }
                    }
                    if (existed) {
                        return {...r, newvalue: row};
                    }
                    else {
                        return r;
                    }
                }));
            }
            else {
                setEditedRows((rows) => [...rows, {newvalue: row, oldvalue: rest, dgrowid: datagrid_row_id}]);
            }            
            setRows((rows) => rows.map((val) => {
                for (let i = 0; i < Object.keys(val).length; i++) {
                    const key = Object.keys(val)[i];
                    if (val[key] !== currRow[key]) {
                        return val;
                    }
                }
                return row;
            }));
            setDialog("");
        }
    };

    const handleSkip = () => {
        if (badRows.length === 1) {
            setCurrRow(undefined);
            setBadRows(badRows.filter((val, i) => i !== 0))
            setDialog("");
        }
        else {
            setCurrRow(badRows[1])
            setBadRows(badRows.filter((val, i) => i !== 0))
        }
    };

    const handleSkipAll = () => {
        setCurrRow(undefined);
        setBadRows([])
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
            {props.correction && (
                <DialogTitle sx={{paddingTop: "0"}}>
                    <Typography fontWeight="bold">{`Kalan geçersiz satır: ${badRows.length}`}</Typography>
                </DialogTitle>
            )}
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
                {props.correction && (
                    <div style={{display: "flex", flexGrow: 1, justifyContent: "start", gap: "12px"}}>
                        <Button variant="contained" onClick={handleSkipAll}>
                            <Typography>Tümünü Atla</Typography>
                        </Button>
                        <Button variant="contained" onClick={handleSkip}>
                            <Typography>Atla</Typography>
                        </Button>
                    </div>                    
                )}
                <Button variant="contained" onClick={handleApply}>
                    <Typography>Güncelle</Typography>
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default Edit;