import React from "react";
import { Link } from "react-router-dom";

class TabMenu extends React.Component {
  render() {
    return (
      <div className='row'>
        <div className='col s12'>
          <ul className='tabs'>
            <li className='tab col s3'>
              <Link className='active' to='/'>
                Main
              </Link>
            </li>
            <li className='tab col s3'>
              <Link to='/admin'>Admin</Link>
            </li>
            <li className='tab col s3'>
              <Link to='/client'>client</Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default TabMenu;
