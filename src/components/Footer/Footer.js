// libs
import React, { Component } from "react";
import moment from "moment";
import { MyLocation, Translate } from "material-ui-icons";
import { translate } from "react-i18next";
import * as clipboard from "clipboard-polyfill";
import PropTypes from "prop-types";

// local
import i18nHelpers from '../../helpers/i18n';
import instance from '../../backend/settings';
import languages from './languages';
import "./Footer.css";

const NS = { ns: 'Footer' };


class Footer extends Component {
	state = {
		copied: false
	}

	static contextTypes = {
		config: PropTypes.object,
	};

	componentDidMount() {
		i18nHelpers.loadResource(languages, NS.ns);
	}	
	
	onCopyLink = () => {
		this.setState({ copied: true });
		clipboard.writeText(document.location.href);
		setTimeout(() => this.setState({ copied: false }), 1500);
	}

	onShareOnFacebook = () => {
		const { language } = this.props
		if (global.window) {
			const { FB } = global.window;
			let { href } = window.location;
			href += (href.indexOf("?") > -1 ? "&" : "?") + "language=" + language;

			if (FB) {
				FB.ui(
					{
						method: "share",
						href,
					},
					function (response) { }
				);
			}
		}
	}

	render() {
		const { onChangeLocation, onChangeLanguage, t, country } = this.props;
		const { disableCountrySelector, disableLanguageSelector } = instance.switches;
		const questionLink = country && country.fields ? instance.countries[country.fields.slug].questionLink : '';
		const showLinkToAdministration = country && country.fields && instance.countries[country.fields.slug].switches.showLinkToAdministration;
		const facebookPage = country && country.fields && instance.countries[country.fields.slug].thirdParty.facebook.page;
		const year = moment().year();

		return (
			<footer className="Footer">
				<div className="light">
					<p>{t("light.Can't find specific information?", NS)}</p>
					<a href={questionLink}>
						<h3>{questionLink.includes('mailto: ') ? questionLink.replace('mailto: ', '') : t("light.Ask us a question", NS)}</h3>
					</a>
				</div>

				<div className="dark">
					<div className="button-container">
						{!disableCountrySelector && (
							<div className="button " onClick={onChangeLocation}>
								<div className="icon-container">
									<MyLocation />
								</div>
								<span>{t("dark.Change Location", NS)}</span>
							</div>
						)}
						{!disableLanguageSelector && (
							<div className="button " onClick={onChangeLanguage}>
								<div className="icon-container">
									<Translate />
								</div>

								<span>{t("dark.Change Language", NS)}</span>
							</div>
						)}

						{facebookPage &&
							<div className="button " onClick={() => window.open(facebookPage)}>
								<div className="icon-container">
									<i className="fa fa-facebook-f" style={{ fontSize: 24 }} />
								</div>
								<span>{t("dark.Find us on Facebook", NS)}</span>
							</div>
						}
					</div>

					<span className="padded Signpost" style={{ direction: "ltr" }}>
						<span>
							{t("dark.Part of the ", NS)}{" "}
							<a href="http://www.signpost.ngo" target="_blank" rel="noopener noreferrer">
								{" "}
								Signpost Project
							</a>
							&nbsp;&copy; {year}.
						</span>
					</span>

					{showLinkToAdministration && (
						<span>
							<a href="http://admin.cuentanos.org" target="blank" className="administration-button">
								Administración
							</a>
						</span>
					)}
				</div>
			</footer>
		);
	}
}

export default translate()(Footer);
