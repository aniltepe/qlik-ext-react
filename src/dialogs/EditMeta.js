import { useState, useContext, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, IconButton, 
    TextField, InputAdornment, List, ListItem, ListItemText, Stack, FormControlLabel, Checkbox } from '@mui/material';
// import { addMeta } from '../services';
import { CustomText, CustomSelect, CustomRadio, FieldType } from '../components';
import { AppContext, DataContext } from '../contexts';
import { Add, ArrowDownward, ArrowUpward, Close, Edit, Remove, Visibility } from '@mui/icons-material';

const EditMeta = (props) => {
    const {setDialog} = useContext(AppContext);
    const {setRows, currRow, editedRows, setEditedRows} = useContext(DataContext);
    const colList = ["appid", "dbtable", "fieldname", "fieldtype", "fieldheader", "fieldrequired", "fieldorder", "fieldformat", "fieldenum", "qsheetid", "qtableid"];
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState(colList.reduce((o, key) => ({...o, [key]: {err: false, htxt: ""}}), {}));

    const [enumMenuOpen, setEnumMenuOpen] = useState(false);
    const [enumAutoValue, setEnumAutoValue] = useState(false);
    const [enumSelectedIdx, setEnumSelectedIdx] = useState(-1);
    const [enumValuePairs, setEnumValuePairs] = useState([]);
    const [enumErrorIdxs, setEnumErrorIdxs] = useState([]);

    useEffect(() => {
        let newValues = colList.reduce((o, key) => ({...o, [key]: currRow[key]}), {});
        setValues(newValues);
    }, [currRow]);

    useEffect(() => {
        if (enumMenuOpen) {
            if (values.fieldenum !== "") {
                setEnumValuePairs(values.fieldenum.split(";").map((val) => [val.split(",")[0], val.split(",")[1]]));
            }
        }
        else {
            setEnumSelectedIdx(-1);
            setEnumValuePairs([]);
            setEnumAutoValue(false);
        }
    }, [enumMenuOpen]);

    // const handleApply = () => {     
    //     const [isValid, errors] = validate();
    //     setErrors(errors);
    //     if (!isValid) {
    //         return;
    //     }

    //     const row = {...values, fieldorder: (values.fieldorder === "" || values.fieldorder == null) ? 0 : parseInt(values.fieldorder)}

    //     const {datagrid_row_id, ...rest} = currRow;
    //     let noChange = true;
    //     for (let i = 0; i < Object.keys(rest).length; i++) {
    //         const key = Object.keys(rest)[i];
    //         if (rest[key] !== row[key]) {
    //             noChange = false;
    //             break;
    //         }
    //     }
    //     if (noChange) {
    //         setDialog("");
    //         return;
    //     }
    //     const existedEdit = editedRows.find((r) => {
    //         for (let i = 0; i < Object.keys(r.newvalue).length; i++) {
    //             const key = Object.keys(r.newvalue)[i];
    //             if (r.newvalue[key] !== rest[key]) {
    //                 return false;
    //             }
    //         }
    //         return true;
    //     })
    //     if (existedEdit) {
    //         setEditedRows((rows) => rows.map((r) => {
    //             let existed = true;
    //             for (let i = 0; i < Object.keys(r.newvalue).length; i++) {
    //                 const key = Object.keys(r.newvalue)[i];
    //                 if (r.newvalue[key] !== rest[key]) {
    //                     existed = false;
    //                     break;
    //                 }
    //             }
    //             if (existed) {
    //                 return {...r, newvalue: row};
    //             }
    //             else {
    //                 return r;
    //             }
    //         }));
    //     }
    //     else {
    //         setEditedRows((rows) => [...rows, {newvalue: row, oldvalue: rest, dgrowid: datagrid_row_id}]);
    //     }            
    //     setRows((rows) => rows.map((val) => {
    //         for (let i = 0; i < Object.keys(val).length; i++) {
    //             const key = Object.keys(val)[i];
    //             if (val[key] !== currRow[key]) {
    //                 return val;
    //             }
    //         }
    //         return row;
    //     }));
    //     setDialog("");
    // };

    // const validate = () => {
    //     let errors = {};
    //     let valid = true;
    //     if (values.appid === "") {
    //         errors.appid = {err: true, htxt: "Giriş yapılması zorunludur."};
    //         valid = false;
    //     }
    //     if (values.dbtable === "") {
    //         errors.dbtable = {err: true, htxt: "Giriş yapılması zorunludur."};
    //         valid = false;
    //     }
    //     if (values.fieldname === "") {
    //         errors.fieldname = {err: true, htxt: "Giriş yapılması zorunludur."};
    //         valid = false;
    //     }
    //     if (values.fieldtype === "") {
    //         errors.fieldtype = {err: true, htxt: "Giriş yapılması zorunludur."};
    //         valid = false;
    //     }
    //     if (values.fieldheader === "") {
    //         errors.fieldheader = {err: true, htxt: "Giriş yapılması zorunludur."};
    //         valid = false;
    //     }
    //     if (values.fieldrequired === "") {
    //         errors.fieldrequired = {err: true, htxt: "Giriş yapılması zorunludur."};
    //         valid = false;
    //     }
    //     if ((values.fieldtype === FieldType.DATE || values.fieldtype === FieldType.DATETIME) && values.fieldformat === "") {
    //         errors.fieldformat = {err: true, htxt: "Giriş yapılması zorunludur."};
    //         valid = false;
    //     }
    //     if (values.fieldtype === FieldType.MENU && values.fieldenum === "") {
    //         errors.fieldenum = {err: true, htxt: "Menü için değer eklenmelidir."};
    //         valid = false;
    //     }
    //     if (values.fieldorder !== "" && isNaN(values.fieldorder)) {
    //         errors.fieldorder = {err: true, htxt: "Sayı girilmelidir."};
    //         valid = false;
    //     }
    //     return [valid, errors];
    // };

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
                <CustomText 
                    k="appid" 
                    onChange={handleChange} 
                    value={values.appid} 
                    label="Qlik App ID" 
                    required={true} 
                    disabled={true}
                    error={errors.appid} />
                <CustomText 
                    k="dbtable" 
                    onChange={handleChange} 
                    value={values.dbtable} 
                    label="DB Tablo Adı" 
                    required={true} 
                    disabled={true}
                    error={errors.dbtable} />
                <CustomText 
                    k="fieldname" 
                    onChange={handleChange} 
                    value={values.fieldname} 
                    label="Alan Adı" 
                    required={true} 
                    disabled={true}
                    error={errors.fieldname} />
                <CustomSelect 
                    k="fieldtype" 
                    onChange={handleChange} 
                    value={values.fieldtype} 
                    label="Alan Tipi"
                    enums={props.metaenum}  
                    required={true} 
                    disabled={true}
                    error={errors.fieldtype} />
                {(values.fieldtype === FieldType.DATE || values.fieldtype === FieldType.DATETIME) && (
                    <CustomText 
                        k="fieldformat" 
                        onChange={handleChange} 
                        value={values.fieldformat} 
                        label="Tarih Formatı" 
                        required={true} 
                        disabled={true}
                        error={errors.fieldformat} />)}
                {values.fieldtype === FieldType.MENU && (
                    <>
                        <TextField 
                            fullWidth
                            size="small" 
                            variant="standard"
                            sx={{pointerEvents: "none"}}
                            label="Menü Değerleri"
                            required={true}
                            disabled={true}
                            value={values.fieldenum.split(";").map((val) => `${val.includes(",") ? val.split(",")[0] + " [" + val.split(",")[1] + "]" : ""}`).join(" | ")}
                            onFocus={(e) => {if (values.fieldenum === "") e.preventDefault()}}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton sx={{pointerEvents: "initial"}} onClick={() => setEnumMenuOpen(true)}>
                                                <Visibility />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }} />
                        <Dialog open={enumMenuOpen}>
                            <DialogTitle sx={{paddingTop: "0", paddingBottom: "0"}}>
                                <div style={{display: "flex", justifyContent: "space-between", gap: "10px", width: "292px",
                                    borderBottom: "1px solid rgba(0,0,0,0.42)", height: "30px", marginTop: "10px"}}>
                                    <Typography sx={{width: "150px", paddingLeft: "16px"}}>Etiket</Typography>
                                    <Typography sx={{width: "100px", paddingRight: "16px"}}>Değer</Typography>
                                </div>
                            </DialogTitle>
                            <DialogContent sx={{display: "flex"}}>
                                <List dense sx={{overflow: "auto"}}>
                                    {enumValuePairs.map((val, idx) => (
                                        <ListItem
                                            key={idx}
                                            onClick={() => setEnumSelectedIdx(idx)}
                                            sx={{display: "flex", justifyContent: "space-between", gap: "10px", paddingTop: "0px",
                                                backgroundColor: enumSelectedIdx === idx ? "#dcf6ff" : "white"
                                            }}>
                                            <TextField
                                                size='small' 
                                                variant='standard' 
                                                placeholder='Etiket giriniz'
                                                sx={{width: "150px"}}
                                                value={val[0]}
                                                disabled={true}
                                                focused={enumSelectedIdx === idx}
                                                error={enumErrorIdxs.includes(idx)}
                                                slotProps={{input: {autoFocus: true}}} />
                                            <TextField
                                                size='small' 
                                                variant='standard' 
                                                placeholder='Değer giriniz'
                                                sx={{width: "100px"}}
                                                disabled={true}
                                                value={enumAutoValue ? idx : val[1]}
                                                error={enumErrorIdxs.includes(idx)}
                                            />
                                        </ListItem>
                                    ))}
                                </List>                                
                            </DialogContent>
                            <DialogActions>
                                <Button variant="contained" onClick={() => setEnumMenuOpen(false)}>
                                    <Typography>Kapat</Typography>
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>                    
                )}
                <CustomText 
                    k="fieldheader" 
                    onChange={handleChange} 
                    value={values.fieldheader} 
                    label="Alan Başlığı" 
                    required={true} 
                    disabled={true}
                    error={errors.fieldheader} />
                <CustomRadio 
                    k="fieldrequired" 
                    onChange={handleChange} 
                    value={values.fieldrequired} 
                    label="Zorunlu Alan mı?" 
                    required={true} 
                    disabled={true}
                    error={errors.fieldrequired} />
                <CustomText 
                    k="fieldorder" 
                    onChange={handleChange} 
                    value={values.fieldorder} 
                    label="Görünme Sırası" 
                    required={false} 
                    disabled={true}
                    error={errors.fieldorder} />
                <CustomText 
                    k="fieldorder" 
                    onChange={handleChange} 
                    value={values.qsheetid} 
                    label="Qlik Sheet ID" 
                    required={false} 
                    disabled={true}
                    error={{err: false, htxt: ""}} />
                <CustomText 
                    k="fieldorder" 
                    onChange={handleChange} 
                    value={values.qtableid} 
                    label="Qlik Table ID" 
                    required={false} 
                    disabled={true}
                    error={{err: false, htxt: ""}} />
            </DialogContent>
        </Dialog>
    );
};

export default EditMeta;