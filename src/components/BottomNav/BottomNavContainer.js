// libs
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { push } from "react-router-redux";

// local
import { BottomNav } from "../";
import instance from '../../backend/settings';
import routes from '../../routes';
import selectedMenuItem from '../../helpers/menu-items';

/**
 * @class
 * @description 
 */
class BottomNavContainer extends React.Component {
	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				country: PropTypes.string,
				category: PropTypes.string,
				article: PropTypes.string,
			}).isRequired,
		}),
	};
	constructor() {
		super();

		this.state = {};
	}

	goToServices(showDepartments, country) {
		let { onGoToServices, onGoToDepartments } = this.props;
		if (showDepartments) {
			onGoToDepartments(country);
		} else {
			onGoToServices(country);
		}
	}

	render() {
		const { country, onGoToCategories, onGoHome, onGoToSearch, showMapButton, goToMap } = this.props;
		let selectedIndex = selectedMenuItem();

		const showDepartments = !!(country.fields && country.fields.slug) && instance.countries[country.fields.slug].switches.showDepartments;
		// TODO: dereference country inside routes?
		return (
			<BottomNav
				index={selectedIndex}
				country={country && country.fields.slug}
				onGoToCategories={onGoToCategories.bind(null, country.fields.slug)}
				onGoHome={onGoHome.bind(null, country.fields.slug)}
				onGoToSearch={onGoToSearch.bind(null, country.fields.slug)}
				onGoToServices={() => { this.goToServices(showDepartments, country.fields.slug) }}
				showMapButton={showMapButton}
				goToMap={goToMap}
			/>
		);
	}
}

const mapState = ({ category, country, router }, p) => ({ category, country, router });

const mapDispatch = (d, p) => ({
	onGoToCategories: country => d(push(routes.goToCategories(country))),
	onGoHome: country => d(push(routes.goHome(country))),
	onGoToSearch: country => d(push(routes.goToSearch(country))),
	onGoToServices: country => d(push(routes.goToServices(country))),
	onGoToDepartments: country => d(push(routes.goToDepartments(country))),
});

export default connect(mapState, mapDispatch)(BottomNavContainer);
