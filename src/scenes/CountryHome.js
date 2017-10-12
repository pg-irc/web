import React from "react";
import moment from "moment";
import services from "../backend";
import { actions } from "../store";
import { connect } from "react-redux";
import { HomeWidget } from "../components";

import {history} from '../store';

class CountryHome extends React.Component {
	constructor() {
		super();

		this.state = {};
	}

	requestLocation() {
		const { geolocation } = global.navigator;
		const { onLocationRequested, country } = this.props;

		if (geolocation) {
			geolocation.getCurrentPosition(
				c => {
					onLocationRequested(c.coords, country);
				},
				e => {
					console.log("Error with geolocation", e);
				},
				{
					enableHighAccuracy: true,
					timeout: 5000,
				}
			);
		}
	}

	componentWillMount() {
		const { firstRequest } = global.window.localStorage;
		if (!firstRequest) {
			global.window.localStorage.firstRequest = moment().toString();
		}
		const { onMount } = this.props;
		onMount();
		//this.requestLocation();
	}
	componentWillUpdate() {
		//this.requestLocation();
	}

	render() {
        const { currentCoordinates, country, onNavigate } = this.props;
        
		if (!country || !country.fields.home) {
			return null;
        }
        
		return country.fields.home.map(e => (
			<HomeWidget onNavigate={onNavigate} country={country} content={e} key={e.sys.id} />
		));
	}
}

const mapState = (s, p) => {
	return {
		articles: s.articles,
		country: s.country,
		currentCoordinates: s.currentCoordinates,
	};
};
const mapDispatch = (d, p) => {
	return {
		onMount: () => {},
		onLocationRequested: (coords, country) => {
			if (country) {
			}
		},
        onNavigate: (path) => {
            setTimeout(() => {
                history.push(path);
            }, 200);
        }
	};
};

export default connect(mapState, mapDispatch)(CountryHome);