import React from 'react';

import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

import '../css/Home.css';

class Home extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      browse_label: "Select file",
      selected_file: null,
      filename_label: "",
      is_selected: false
    }
  }

  select_file = event => {
    this.setState({
      selected_file: event.target.files[0],
      browse_label: "Change file",
      filename_label: "(Selected file: " + event.target.files[0].name + ")",
      is_selected: true,
    });
  }

  render() {
    return (
      <div className = "page_container">

        <Navbar />

        <div className = "form_container">

          <div className = "label_container">
            <label className = "label1"> Upload your files in a single place </label>

            <input type="file" id="select_file" onChange = {this.select_file} hidden />

            <div className = "browse_label_container">
              <label for="select_file" className = "browse_label"> {this.state.browse_label} </label>
              <label className = "label2">{this.state.filename_label}</label>
            </div>

            <label className = "label2"> This portal provides an easy way to upload all your files safely </label>
          </div>

          <Footer data = {{file_selected: this.state.is_selected, file: this.state.selected_file}} />

        </div>
      </div>
    );
  }

}

export default Home;
