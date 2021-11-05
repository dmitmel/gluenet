import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Search.scss';

export default class Search extends Component {
  static propTypes = {
    placeholder: PropTypes.string,
    onSearch: PropTypes.func
  };

  state = { value: '' };

  _onInputChange = e => {
    this.setState({ value: e.target.value });
  };

  _onSearchClicked = e => {
    e.preventDefault();
    let value = this.state.value;
    if (value) {
      let onSearch = this.props.onSearch;
      if (onSearch) onSearch(value);
    } else {
      this.input.focus();
    }
  };

  _onClearClicked = e => {
    e.preventDefault();
    this.setState({ value: '' });
  };

  render() {
    return (
      <form className="search">
        <button
          type="submit"
          className="search__submit btn btn-icon"
          onClick={this._onSearchClicked}
          aria-label="Search">
          <i className="fa fa-search fa-fw" aria-hidden="true" />
        </button>
        <input
          type="search"
          className="search__input form-control"
          placeholder={this.props.placeholder}
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          value={this.state.value}
          onChange={this._onInputChange}
          ref={el => (this.input = el)}
        />
        <button
          type="reset"
          className="search__clear btn btn-icon"
          onClick={this._onClearClicked}
          aria-label="Clear">
          <i className="fa fa-times fa-fw" aria-hidden="true" />
        </button>
      </form>
    );
  }
}
