import React from "react";
import "./ServiceHome.css";
import { translate } from "react-i18next";
import _ from "lodash";
import { Share, Link  } from "material-ui-icons";
import { Helmet } from "react-helmet";
import HeaderBar from "./HeaderBar";
import { CopyToClipboard } from "react-copy-to-clipboard";
import PropTypes from "prop-types";

// eslint-disable-next-line
var tinycolor = require("tinycolor2");
//const GMAPS_API_KEY = "AIzaSyA7eG6jYi03E6AjJ8lhedMuaLS9mVoJjJ8";

//temp API Key from Andres Aguilar
const GMAPS_API_KEY ="AIzaSyAK54Ir69gNM--M_5dRa0fwVH8jxWnJREQ";
const hotlinkTels = input => input; //input.replace(/\s(\+[1-9]{1}[0-9]{5,14})|00[0-9]{5,15}/g, `<a class="tel" href="tel:$1">$1</a>`);
const moment = global.moment;

class ServiceDetail extends React.Component {
	state = {
		service: null,
		relatedServices: [],
	};

	static propTypes = {
			slug: PropTypes.string,
			title: PropTypes.string,
		};
	constructor(props){
		super(props);
		const { language } = this.props;
		let { href } = window.location;
		let copySlug = (href += (window.location.toString().indexOf("?") > -1 ? "&" : "?") + "language=" + language);
		this.state = { value: copySlug, copied: true, shareIN: true, showOtherServices: true };
		this.sharePage = this.sharePage.bind(this);
		this.showServices = this.showServices.bind(this);
		this.Copiedlnk = this.Copiedlnk.bind(this);
	}

	showServices(){
		this.setState({ showOtherServices: !this.state.showOtherServices });
	}

	sharePage() {
		this.setState(prevState => ({ shareIN: false }));
	}

	Copiedlnk() {
		this.setState(prevState => ({ copied: !prevState.copied }));
		setTimeout(() => {
			this.setState({ shareIN: true });
			setTimeout(() => {
				this.setState(prevState => ({ copied: !prevState.copied }));
			}, 2);
		}, 3000);
	}

	share() {
		const { language } = this.props;

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

	componentDidMount() {
		const { fetchService, fetchServicesInSameLocation } = this.props;
		if (fetchService) {
			fetchService().then(service => this.setState({ service }));
		}

		if (fetchServicesInSameLocation) {
			fetchServicesInSameLocation().then(relatedServices => this.setState({ relatedServices }));
		}
	}
	renderContactInformation(ci) {
		let { text, type } = ci;
		let typography;
		let action;
		let typeText;

		switch(type) {
			case "whatsapp":
				typography = "MenuIcon fa fa-whatsapp";
				action = `whatsapp://send?phone=${text}`;
				typeText = "Whatsapp: ";
				break;
			case "skype":
				typography = "MenuIcon fa fa-skype";
				action = `skype:${text}?chat`;
				typeText = "Skype: ";
				break;
			case "facebook_messenger":
				typography = "MenuIcon fa fa-facebook";
				action = `http://m.me/${text}`;
				typeText = "Facebook Messenger: ";
				break;
			case "viber":
				typography = "MenuIcon fa fa-phone";
				action = `viber://add?number=${text}`;
				typeText = "Viber: ";
				break;
			case "phone":
				typography = "MenuIcon fa fa-phone";
				action = `tel:${text}`;
				typeText = "Call: ";
				break;
			case "email":
				typography = "MenuIcon fa fa-envelope-o";
				action = `mailto:${text}`;
				typeText = "Email: ";
				break;
			default:
				break;
		}
		return (
			<div>
				<hr />
				<div className="Selector" onClick={() => window.open(action)}>
					<h1>
						<div style={{
							display: 'inline-block', direction: 'ltr', width: '100%',
							overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
						}}>
							{typeText}{text}
						</div>
					</h1>
					<i className={typography} aria-hidden="true" />
				</div>
			</div>
		)
	}
	
	render() {
		const { service, relatedServices } = this.state;
		const { t, language, goToService } = this.props;
		const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		if (!service) {
			return (
				<div className="ServiceList">
					<HeaderBar title={t("Service Detail")} />
					<div className="loader" />
				</div>
			);
		}
		const firstOrDefault = a => _.first(a) || {};
		const toUrl = u => (u.indexOf("http") === -1 ? `http://${u}` : u);
		const hasHours = o => {
			return o["24/7"] || weekDays.map(w => o[w.toLowerCase()].map(h => !!(h.open || h.close)).indexOf(true) > -1).indexOf(true) > -1;
		};

		const mLocale = d => {
			let a = moment(d)
				.locale(language)
				.format("LLL");
			return a;
		};
		const amPmTime = time => {
			const m = moment(moment(`2001-01-01 ${time}`).toJSON())
				.locale(false)
				.locale(language);
			return `${m.format("hh:mm")} ${m.hour() >= 12 ? t("pm") : t("am")}`;
		};
		const serviceProviderElement = s => {
			return s.provider.website ? (
				<a href={toUrl(s.provider.website)} rel="noopener noreferrer" target="_blank">
					{s.provider.name}
				</a>
			) : (
					s.provider.name
				);
		};

		let point = service.location && _.reverse(_.clone(service.location.coordinates)).join(",");

		const showTimeTable = service => {
			return weekDays.map((w, i) => {
				if (!firstOrDefault(service.opening_time[w.toLowerCase()]).open) {
					return (
						<tr key={`tr-${i}`}>
							<td className="week">{t(w)}</td>
							<td colSpan="3">{t("Closed")}</td>
						</tr>
					);
				}

				return service.opening_time[w.toLowerCase()].map((o, oi) => (
					<tr key={`tr-${i}-${oi}`}>
						{oi === 0 && (
							<td rowSpan={service.opening_time[w.toLowerCase()].length} className="week">
								{t(w)}
							</td>
						)}
						<td key={`open-${i}-${oi}`}>{amPmTime(service.opening_time[w.toLowerCase()][oi].open)}</td>
						<td>-</td>
						<td key={`close-${i}-${oi}`}>{amPmTime(service.opening_time[w.toLowerCase()][oi].close)}</td>
					</tr>
				));
			});
		};
		
		// service translated fields
		let serviceT = {
			additional_info: service[`additional_info_${language}`],
			address: service[`address_${language}`],
			address_city: service[`address_city_${language}`],
			address_floor: service[`address_floor_${language}`],
			description: service[`description_${language}`],
			languages_spoken: service[`languages_spoken_${language}`],
			name: service[`name_${language}`],
		};

		let fullAddress = [serviceT.address, serviceT.address_floor].filter(val => val).join(', ');

		let sortedContactInformation = _.sortBy(service.contact_information || [], ci => {
			return ci.index;
		});

		return (
			<div className="ServiceDetail">
				<Helmet>
					<title>{serviceT.name}</title>
				</Helmet>
				<HeaderBar subtitle={`${_.first(service.types).name}:`} title={serviceT.name} />
				<div className="hero">
					<h2>
						<small>{t("Service Provider")}:</small>
						{serviceProviderElement(service)}
					</h2>
					{service.image && <div className="HeroImageContainer"><img src={service.image} alt={service.provider.name} /></div>}
				</div>

				<article>
					<em>{t("LAST_UPDATED") + " " + mLocale(service.updated_at)}</em>
					<h2>{serviceT.name}</h2>
					<p dangerouslySetInnerHTML={{ __html: hotlinkTels(serviceT.description) }} />

					{serviceT.additional_info && <h3>{t("Additional Information")}</h3>}
					{serviceT.additional_info && <p dangerouslySetInnerHTML={{ __html: hotlinkTels(serviceT.additional_info) }} />}

					{serviceT.languages_spoken && <h3>{t("Languages Spoken")}</h3>}
					{serviceT.languages_spoken && <p dangerouslySetInnerHTML={{ __html: serviceT.languages_spoken }} />}

					{hasHours(service.opening_time) && (
						<span>
							<h3>{t("Visiting hours")}</h3>
							<div>{service.opening_time["24/7"] && t("Open 24/7")}</div>
							<div className="openingTable">
								{!service.opening_time["24/7"] && (
									<table>
										<tbody>{showTimeTable(service)}</tbody>
									</table>
								)}
							</div>
						</span>
					)}
					{serviceT.address_city && <h4>{t("City")}</h4>}
					{serviceT.address_city && <p>{serviceT.address_city}</p>}

					{serviceT.address && <h3>{t("Address")}</h3>}
					{fullAddress && <p>{fullAddress}</p>}

					{service.address_in_country_language && <h3>{t("Address in Local Language")}</h3>}
					{service.address_in_country_language && <p>{service.address_in_country_language}</p>}

					{point && (
						<p>
							<img
								className="MapCursor"
								alt={serviceT.name}
								onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${point}`)}
								src={`https://maps.googleapis.com/maps/api/staticmap?center=${point}&zoom=16&size=600x300&maptype=roadmap&markers=${point}&key=${GMAPS_API_KEY}`}
							/>
						</p>
					)}

				</article>
				{this.state.showOtherServices ? (
				<div className="footer">

					{<hr className="divider" />}
					{this.state.shareIN ? (
						<div className="selector" onClick={() => this.sharePage()}>
							<h1>{t("Share this page")}</h1>
							<Share className="icon" />
						</div>
					) : (
						<div className="selector sharePage">
							<h1
								onClick={() => {
									this.share();
								}}
							>
								{t("Share on Facebook")}
							</h1>
							<Share className="icon" />
							<div className="verticalHR" />
							<CopyToClipboard sharePage={this.sharePage} text={this.state.value}>
								{this.state.copied ? <h1 onClick={() => this.Copiedlnk()}>{t("Copy Link")}</h1> : <h1>{t("Copied")}</h1>}
							</CopyToClipboard>
							<Link className="icon" />
						</div>
					)}

					{service.location && <hr />}
					{service.location && (
						<div className="Selector" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${point}`)}>
							<h1>{t("Get directions")}</h1>
							<i className="MenuIcon fa fa-map" aria-hidden="true" />
						</div>
					)}

					{service.phone_number && <hr />}
					{service.phone_number && (
						<div className="Selector" onClick={() => window.open(`tel:${service.phone_number}`)}>
							<h1>
								{t("Call")}:
								<a className="phoneFormat" href={`tel:${service.phone_number}`} >{service.phone_number}</a>
							</h1>
							<i className="MenuIcon fa fa-phone" aria-hidden="true" />
						</div>
					)}

					{service.email && <hr />}
					{service.email && (
						<div className="Selector" onClick={() => window.open(`mailto:${service.email}`)}>
							<h1><span style={{ display: 'inline-block', overflow: 'hidden' }}>{t('Email')}: </span><div style={{
								display: 'inline-block', direction: 'ltr', maxWidth: '60%',
								overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
							}}>
								{service.email}</div></h1>
							<i className="MenuIcon fa fa-envelope-o" aria-hidden="true" />
						</div>
					)}

					{service.website && <hr />}
					{service.website && (
						<div className="Selector" onClick={() => window.open(`${toUrl(service.website)}`)}>
							<h1><div style={{
								display: 'inline-block', direction: 'ltr', maxWidth: '85%',
								overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
							}}>
								{t('Website')}: {service.website}</div></h1>
							<i className="MenuIcon fa fa-external-link" aria-hidden="true" />
						</div>
					)}

					{service.facebook_page && <hr />}
					{service.facebook_page && (
						<div className="Selector" onClick={() => window.open(`${toUrl(service.facebook_page)}`)}>
							<h1><div style={{
								display: 'inline-block', direction: 'ltr', maxWidth: '85%',
								overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
							}}>
								{t('Facebook')}: {service.facebook_page}</div></h1>
							<i className="MenuIcon fa fa-facebook-f" aria-hidden="true" />
						</div>
					)}

					{<hr className="divider" />}
					{relatedServices && (
					<div className="selector" onClick={() => this.showServices()}>
						<h1>{t("Other services at this location")}</h1>
						<i className="MenuIcon fa fa-angle-right" aria-hidden="true" />
					</div>)}
					{service.contact_information && sortedContactInformation.map(ci => this.renderContactInformation(ci))}
				</div>)
				:(
					<div>
					<div className="RelatedServices">
						<h3>{t("OTHER_SERVICES")}:</h3>
						<hr/>
							{relatedServices.map(r => (
								<div key={r.id} onClick={() => goToService(r.id)}>
									<div className="selector">
										<h1 href="javascript:void(0)" ><div style={{
											display: 'inline-block', direction: 'ltr', maxWidth: '60%',
											overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
										}}>{r.name}</div></h1>
										<i className="MenuIcon fa fa-angle-right" aria-hidden="true" />
									</div>
									<hr/>
								</div>
							))}
					</div>
					<div className="selector" onClick={() => this.showServices()}>
						<h1>{t("Back")}</h1>
						<i className="MenuIcon fa fa-angle-left" aria-hidden="true" />
					</div>
					</div>
				)}
			</div>
		);
	}
}
export default translate()(ServiceDetail);
