import { useState, useContext, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, IconButton, 
    TextField, InputAdornment, List, ListItem, ListItemText, Stack, FormControlLabel, Checkbox } from '@mui/material';
// import { addMeta } from '../services';
import { CustomText, CustomSelect, CustomRadio, FieldType } from '../components';
import { AppContext, DataContext } from '../contexts';
import { Add, ArrowDownward, ArrowUpward, Close, Edit, Remove } from '@mui/icons-material';

const AddMeta = (props) => {
    const {setDialog} = useContext(AppContext);
    const {setRows} = useContext(DataContext);
    const colList = ["appid", "dbtable", "fieldname", "fieldtype", "fieldheader", "fieldrequired", "fieldorder", "fieldformat", "fieldenum"];
    const [values, setValues] = useState(colList.reduce((o, key) => ({...o, [key]: ""}), {}));
    const [errors, setErrors] = useState(colList.reduce((o, key) => ({...o, [key]: {err: false, htxt: ""}}), {}));

    const [enumMenuOpen, setEnumMenuOpen] = useState(false);
    const [enumAutoValue, setEnumAutoValue] = useState(false);
    const [enumSelectedIdx, setEnumSelectedIdx] = useState(-1);
    const [enumValuePairs, setEnumValuePairs] = useState([]);
    const [enumErrorIdxs, setEnumErrorIdxs] = useState([]);

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

    const handleApply = () => {     
        const [isValid, errors] = validate();
        setErrors(errors);
        if (!isValid) {
            return;
        }
        setRows((rows) => [...rows, {...values, fieldorder: (values.fieldorder === "" || values.fieldorder == null) ? 0 : parseInt(values.fieldorder)}]);
        setDialog("");
    };

    const validate = () => {
        let errors = {};
        let valid = true;
        if (values.appid === "") {
            errors.appid = {err: true, htxt: "Giriş yapılması zorunludur."};
            valid = false;
        }
        if (values.dbtable === "") {
            errors.dbtable = {err: true, htxt: "Giriş yapılması zorunludur."};
            valid = false;
        }
        if (values.fieldname === "") {
            errors.fieldname = {err: true, htxt: "Giriş yapılması zorunludur."};
            valid = false;
        }
        if (values.fieldtype === "") {
            errors.fieldtype = {err: true, htxt: "Giriş yapılması zorunludur."};
            valid = false;
        }
        if (values.fieldheader === "") {
            errors.fieldheader = {err: true, htxt: "Giriş yapılması zorunludur."};
            valid = false;
        }
        if (values.fieldrequired === "") {
            errors.fieldrequired = {err: true, htxt: "Giriş yapılması zorunludur."};
            valid = false;
        }
        if ((values.fieldtype === FieldType.DATE || values.fieldtype === FieldType.DATETIME) && values.fieldformat === "") {
            errors.fieldformat = {err: true, htxt: "Giriş yapılması zorunludur."};
            valid = false;
        }
        if (values.fieldtype === FieldType.MENU && values.fieldenum === "") {
            errors.fieldenum = {err: true, htxt: "Menü için değer eklenmelidir."};
            valid = false;
        }
        if (values.fieldorder !== "" && isNaN(values.fieldorder)) {
            errors.fieldorder = {err: true, htxt: "Sayı girilmelidir."};
            valid = false;
        }
        return [valid, errors];
    };

    const handleChange = (evt, key) => {
        setValues({...values, [key]: evt.target.value});
    };

    const handleEnumLabelChange = (evt, index) => {
        if (evt.target.value.includes(";") || evt.target.value.includes(",")) {
            return;
        }
        setEnumValuePairs([...enumValuePairs.slice(0, index), ...[[evt.target.value, enumValuePairs[index][1]]], ...enumValuePairs.slice(index + 1, enumValuePairs.length)]);
    };

    const handleEnumValueChange = (evt, index) => {
        if (evt.target.value.includes(";") || evt.target.value.includes(",")) {
            return;
        }
        setEnumValuePairs([...enumValuePairs.slice(0, index), ...[[enumValuePairs[index][0], evt.target.value]], ...enumValuePairs.slice(index + 1, enumValuePairs.length)])
    };

    const handleEnumApply = () => {
        let isValid = true;
        const errorIdxs = [];
        for (let i = 0; i < enumValuePairs.length; i++) {
            if (enumValuePairs[i][0] === "" || (enumValuePairs[i][1] === "" && !enumAutoValue)) {
                errorIdxs.push(i);
                isValid = false;
            }
        }
        setEnumErrorIdxs(errorIdxs);
        setEnumSelectedIdx(-1);
        if (isValid) {
            if (enumAutoValue) {
                setValues({...values, fieldenum: enumValuePairs.map((pair, i) => `${pair[0]},${i}`).join(";")})
            }
            else {
                setValues({...values, fieldenum: enumValuePairs.map((pair) => `${pair[0]},${pair[1]}`).join(";")})
            }
            setEnumValuePairs([]);
            setEnumAutoValue(false);
            setEnumMenuOpen(false);
        }
    }

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
                    disabled={false}
                    error={errors.appid} />
                <CustomText 
                    k="dbtable" 
                    onChange={handleChange} 
                    value={values.dbtable} 
                    label="DB Tablo Adı" 
                    required={true} 
                    disabled={false}
                    error={errors.dbtable} />
                <CustomText 
                    k="fieldname" 
                    onChange={handleChange} 
                    value={values.fieldname} 
                    label="Alan Adı" 
                    required={true} 
                    disabled={false}
                    error={errors.fieldname} />
                <CustomSelect 
                    k="fieldtype" 
                    onChange={handleChange} 
                    value={values.fieldtype} 
                    label="Alan Tipi"
                    enums={props.metaenum}  
                    required={true} 
                    disabled={false}
                    error={errors.fieldtype} />
                {(values.fieldtype === FieldType.DATE || values.fieldtype === FieldType.DATETIME) && (
                    <CustomText 
                        k="fieldformat" 
                        onChange={handleChange} 
                        value={values.fieldformat} 
                        label="Tarih Formatı" 
                        required={true} 
                        disabled={false}
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
                            value={values.fieldenum.split(";").map((val) => `${val.includes(",") ? val.split(",")[0] + " [" + val.split(",")[1] + "]" : ""}`).join(" | ")}
                            onFocus={(e) => {if (values.fieldenum === "") e.preventDefault()}}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton sx={{pointerEvents: "initial"}} onClick={() => setEnumMenuOpen(true)}>
                                                <Edit />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }} />
                        <Dialog open={enumMenuOpen}>
                            <DialogTitle sx={{paddingTop: "0", paddingBottom: "0"}}>
                                <FormControlLabel 
                                    label="Otomatik sıralı değer" 
                                    control={<Checkbox checked={enumAutoValue} onChange={() => setEnumAutoValue(!enumAutoValue)} />} />
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
                                                focused={enumSelectedIdx === idx}
                                                onChange={(e) => handleEnumLabelChange(e, idx)}
                                                error={enumErrorIdxs.includes(idx)}
                                                slotProps={{input: {autoFocus: true}}} />
                                            <TextField
                                                size='small' 
                                                variant='standard' 
                                                placeholder='Değer giriniz'
                                                sx={{width: "100px"}}
                                                disabled={enumAutoValue}
                                                value={enumAutoValue ? idx : val[1]}
                                                error={enumErrorIdxs.includes(idx)}
                                                onChange={(e) => handleEnumValueChange(e, idx)}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                                <Stack spacing={1} sx={{marginLeft: enumValuePairs.length > 0 ? "10px" : "302px"}}>
                                    <IconButton 
                                        onClick={() => {
                                            setEnumSelectedIdx(enumValuePairs.length); 
                                            setEnumValuePairs((pairs) => [...pairs, ["", ""]]);
                                        }}
                                    >
                                        <Add />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => {
                                            const newIdx = enumValuePairs.length - 2;
                                            setEnumValuePairs((pairs) => pairs.filter((p, i) => i !== enumSelectedIdx));
                                            setEnumSelectedIdx(newIdx); 
                                            if (enumErrorIdxs.includes(enumSelectedIdx)) {
                                                setEnumErrorIdxs((idxs) => idxs.filter((val) => val !== enumSelectedIdx));
                                            }
                                        }} 
                                        disabled={enumSelectedIdx === -1}
                                    >
                                        <Remove />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => {
                                            setEnumValuePairs((pairs) => pairs.map((p, i) => {
                                                if (i === enumSelectedIdx - 1) {
                                                    return enumValuePairs[i + 1];
                                                }
                                                else if (i === enumSelectedIdx) {
                                                    return enumValuePairs[i - 1];
                                                }
                                                else {
                                                    return p;
                                                }
                                            }));
                                            setEnumSelectedIdx(enumSelectedIdx - 1); 
                                            if (enumErrorIdxs.includes(enumSelectedIdx)) {
                                                setEnumErrorIdxs((idxs) => idxs.map((val) => val === enumSelectedIdx ? val - 1 : val));
                                            }
                                        }}
                                        disabled={enumSelectedIdx === 0 || enumSelectedIdx === -1}><ArrowUpward /></IconButton>
                                    <IconButton 
                                        onClick={() => {
                                            setEnumValuePairs((pairs) => pairs.map((p, i) => {
                                                if (i === enumSelectedIdx + 1) {
                                                    return enumValuePairs[i - 1];
                                                }
                                                else if (i === enumSelectedIdx) {
                                                    return enumValuePairs[i + 1];
                                                }
                                                else {
                                                    return p;
                                                }
                                            }));
                                            setEnumSelectedIdx(enumSelectedIdx + 1);
                                            if (enumErrorIdxs.includes(enumSelectedIdx)) {
                                                setEnumErrorIdxs((idxs) => idxs.map((val) => val === enumSelectedIdx ? val + 1 : val));
                                            }
                                        }}
                                        disabled={enumSelectedIdx === enumValuePairs.length - 1 || enumSelectedIdx === -1}><ArrowDownward /></IconButton>
                                </Stack> 
                            </DialogContent>
                            <DialogActions>
                                {enumErrorIdxs.length > 0 && <Typography sx={{color: "#d32f2f"}}>Değerleri kontrol ediniz.</Typography>}
                                <Button disabled={enumValuePairs.length === 0} variant="contained" onClick={handleEnumApply}>
                                    <Typography>Uygula</Typography>
                                </Button>
                                <Button variant="contained" onClick={() => setEnumMenuOpen(false)}>
                                    <Typography>İptal</Typography>
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
                    disabled={false}
                    error={errors.fieldheader} />
                <CustomRadio 
                    k="fieldrequired" 
                    onChange={handleChange} 
                    value={values.fieldrequired} 
                    label="Zorunlu Alan mı?" 
                    required={true} 
                    disabled={false}
                    error={errors.fieldrequired} />
                <CustomText 
                    k="fieldorder" 
                    onChange={handleChange} 
                    value={values.fieldorder} 
                    label="Görünme Sırası" 
                    required={false} 
                    disabled={false}
                    error={errors.fieldorder} />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleApply}>
                    <Typography>Ekle</Typography>
                </Button>
            </DialogActions> 
        </Dialog>
    );
};

export default AddMeta;