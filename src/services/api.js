import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_URL;
console.log("baseUrl: ", baseUrl);

export const add = (data, appid, dbtable) => {
    let url = baseUrl + '/api/add';
    return axios.post(url, data, {params: {appid: appid, dbtable: dbtable}});
}

export const addMeta = (data) => {
    let url = baseUrl + '/api/addmeta';
    return axios.post(url, data);
}

export const getColumns = (appid, dbtable) => {
    let url = baseUrl + '/api/columns';
    return axios.get(url, {params: {appid: appid, dbtable: dbtable}});
}

export const getRows = (dbtable) => {
    let url = baseUrl + '/api/rows';
    return axios.get(url, {params: {dbtable: dbtable}});
}

export const getRowsMeta = () => {
    let url = baseUrl + '/api/rowsmeta';
    return axios.get(url);
}

export const postCsv = (file) => {
    let url = baseUrl + '/api/uploadcsv';
    console.log(file)
    const form = new FormData();
    form.append('file', file);
    form.append('filename', file.name);
    return axios.post(url, form, {headers: {"Content-Type": 'multipart/form-data'}});
}

export const postXls = (file) => {
    let url = baseUrl + '/api/uploadxls';
    console.log(file)
    const form = new FormData();
    form.append('file', file);
    form.append('filename', file.name);
    return axios.post(url, form, {headers: {"Content-Type": 'multipart/form-data'}});
}

export const addMetaBulk = (data) => {
    let url = baseUrl + '/api/addmetabulk';
    return axios.post(url, data);
}

export const editMetaBulk = (data) => {
    let url = baseUrl + '/api/editmetabulk';
    return axios.post(url, data);
}

export const addBulk = (data, appid, dbtable) => {
    let url = baseUrl + '/api/addbulk';
    return axios.post(url, data, {params: {appid: appid, dbtable: dbtable}});
}

export const editBulk = (data, appid, dbtable) => {
    let url = baseUrl + '/api/editbulk';
    return axios.post(url, data, {params: {appid: appid, dbtable: dbtable}});
}

export const deleteBulk = (data, appid, dbtable) => {
    let url = baseUrl + '/api/deletebulk';
    return axios.post(url, data, {params: {appid: appid, dbtable: dbtable}});
}