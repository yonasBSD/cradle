/**
 * NavbarItem - a button in the navbar.
 * @param props
 * @param props.icon - the icon to display in the button
 * @param props.onClick - the handler for the button
 * @returns {NavbarItem}
 * @constructor
 */
export default function NavbarItem(props){
    return (
	        <button className="navbar-item hover:bg-gray-4" onClick={props.onClick}>
                {props.icon}
            </button>
    );
}