import React from 'react';
import axios from 'axios';

import '../css/Footer.css';

import IP from '../IPconfig';

class Footer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      uploading: false,
      pause: false,
      resume: false
    };
  }

  async getUploadedBytes(file_id) {


    let res = await axios.get('http://' +  IP.ip + '/user/curr_byte', {
      headers: {
        'file_id': file_id
      }
    });

    var obj = {
      'status': res.status,
      'bytes': +res.data
    }

    return obj;
  }

  onProgress(uploaded_byte, total) {
    console.log(`Uploaded ${uploaded_byte} out of ${total}`);
  }

  async make_upload_req(start_byte, file_id) {
    let xhr = this.xhr = new XMLHttpRequest();

    xhr.open('POST', 'http://' +  IP.ip + '/user/upload', true); // configuring the request

    xhr.setRequestHeader('file_id', file_id); // adding file_id in the req header
    xhr.setRequestHeader('start_byte', start_byte); // adding current byte in the req header

    // xhr.upload.onprogress = (event) => {
    //   this.onProgress(start_byte + event.loaded, start_byte + event.total); // to show the upload progress to user
    // }

    console.log(`${start_byte}`);

    var formData = new FormData();
    formData.append('file', this.props.data.file.slice(start_byte));

    xhr.send(this.props.data.file.slice(start_byte));

    return await new Promise((resolve, reject) => {

      xhr.onload = xhr.onerror = () => {
        if(xhr.status == 200) resolve(true);
        else reject(new Error('Upload failed: ' + xhr.statusText));
      }

      xhr.onabort = () => resolve(false); // is trigerred when abort is called -- pauses the upload
    })
  }

  async upload_file() {
    let file = this.props.data.file;

    var file_id = file.name + '-' + file.size + '-' + file.lastModified;

    var data = await this.getUploadedBytes(file_id);

    if(data.status != 200) {
      this.setState({
        uploading: false
      }, () => alert(`Unable to upload file. Request failed with status ${data.status}`));
      return;
    }

    var is_uploaded = await this.make_upload_req(data.bytes, file_id);

    if(is_uploaded) {
      console.log('Success: File is uploaded');
      this.setState({
        uploading: false,
        pause: false,
        resume: false
      })
    }
    else console.log('Upload is paused');
  }

  upload = () => {
    if(this.props.data.file_selected) {
      this.setState({uploading: true}, () => {
        this.upload_file();
      });
    }
    else alert('There is nothing to upload. Please select a file');
  }

  delete_pending() {
    this.xhr.abort(); // abort the current upload first

    // make a request to server telling it to delete the pending upload
    let file = this.props.data.file;

    var file_id = file.name + '-' + file.size + '-' + file.lastModified;

    axios.get('http://' +  IP.ip + '/user/cancel_upload', {
      headers: {
        'file_id': file_id
      }
    })
    .then(res => console.log(res.data))
    .catch(err => console.log(err));
  }

  cancel = () => {
    if(this.state.uploading || this.state.pause || this.state.resume) {
      this.setState({
        uploading: false,
        pause: false,
        resume: false
      }, () => this.delete_pending());
    }
    else alert('There is nothing to cancel');
  }

  pause = () => {
    this.setState({
      uploading: false,
      pause: true,
      resume: false
    }, () => this.xhr.abort());
  }

  resume = () => {
    this.setState({
      uploading: true,
      resume: true,
      pause: false
    }, () => this.upload_file());
  }

  render_upload_btn() {
    if(!this.state.uploading && !this.state.pause) {
      return (
        <button className = "footer_btn" id = "submit_btn" onClick = {this.upload}>Upload File</button>
      );
    }

    else {
      if(!this.state.pause) {
        return(
          <button className = "footer_btn" id = "pause_btn" onClick = {this.pause}>Pause</button>
        );
      }
      else {
        return(
          <button className = "footer_btn" id = "resume_btn" onClick = {this.resume}>Resume</button>
        );
      }
    }
  }

  render_cancel_btn() {
    return(
      <button className = "footer_btn" id = "cancel_btn" onClick = {this.cancel}>Cancel</button>
    );
  }

  render() {
    return(
      <div className = "footer_container">
        {this.render_upload_btn()}
        {this.render_cancel_btn()}
      </div>
    );
  }
}

export default Footer;
