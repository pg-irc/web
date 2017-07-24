import React from 'react';
import { actions } from '../store';
import { connect } from 'react-redux'
import {
    AppHeader,
    Footer
} from '../components';
import { BottomNavContainer } from '../containers'
import { push, } from 'react-router-redux';
import {history} from '../store';

import './Skeleton.css';

class Skeleton extends React.Component {

    componentWillMount() {
    }

    render() {
        const {
            children,
            country,
            language,
            match,
            onGoHome,
            onGoToSearch,
            onChangeLocation,
            onChangeCountry,
            onChangeLanguage,
        } = this.props;

        return (<div className="Skeleton">
            <AppHeader country={country}
                language={language}
                onGoHome={onGoHome(country)}
                onGoToSearch={onGoToSearch(country)}
                onChangeCountry={onChangeLocation}
            />
            {children}
            {(country && language) && <Footer
                onChangeLocation={onChangeLocation}
                onChangeLanguage={onChangeLanguage} />}
            {(country && language) && <BottomNavContainer match={match} />
            }
        </div>);
    }
}

const mapState = ({ country, language }, p) => {
    return {
        country,
        language
    };
};
const mapDispatch = (d, p) => {
    return {
        onGoHome: (country) => () => {
            if (country)
                d(push(`/${country.slug || ''}`));
        },
        onGoToSearch: (country) => () => {
            if (country)
                d(push(`/${country.slug}/search`));
        },
        onChangeLocation: () => {
            d(actions.changeCountry(null));
            d(push(`/country-selector`));
        },
        onChangeLanguage: () => {
            d(actions.changeLanguage(null));
            d(push(`/language-selector`));
        },
    };
};

export default connect(mapState, mapDispatch)(Skeleton);
