class Uploader {

  constructor({file, onProgress}) {
      this.file = file;
      this.onProgress = onProgress;

      this.fileID = file.name + '-' + file.size + '-' + file.lastModified;
  }

  async getUploadedBytes() {
    let response = await fetch('status', {
      headers: {
        'file_id': this.fileID
      }
    });

    if(response.status != 200) {
      throw new Error("Can't get uploaded bytes: " + response.statusText);
    }

    let text = await response.text();

    return +text;
  }

  async upload() {
    this.curr_byte = await this.getUploadedBytes();

    let xhr = this.xhr = new XMLHttpRequest();

    xhr.setRequestHeader('file_id', this.fileID);
    xhr.setRequestHeader('curr_byte', this.curr_byte);

    xhr.open("POST", "/user/csv-upload", true);

    xhr.upload.onprogress = (event) => {
      this.onProgress(this.curr_byte + event.loaded, this.curr_byte + event.total);
    }

    console.log(`Send the file from byte: ${this.curr_byte}`);
    
    xhr.send(this.file.slice(this.curr_byte));

    return await new Promise((resolve, reject) => {

      xhr.onload = xhr.onerror = () => {
        console.log(`${xhr.status} text: ${xhr.statusText}`);

        if(xhr.status == 200) resolve(true);
        else reject(new Error("Upload failed:" + xhr.statusText));
      }

      xhr.onabort = () => resolve(false);
    });
  }

  stop() {
    if(this.xhr) this.xhr.abort();
  }
}
