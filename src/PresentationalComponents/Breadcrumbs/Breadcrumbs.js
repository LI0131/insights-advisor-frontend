import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import * as AppActions from '../../AppActions';
import './_breadcrumbs.scss';
import messages from '../../Messages';

const Breadcrumbs = ({ breadcrumbs, current, fetchRule, match, ruleFetchStatus, rule, intl }) => {
    const [items, setItems] = useState([]);
    const [ruleDescriptionLoaded, setRuleDescription] = useState(false);
    const buildBreadcrumbs = useCallback(() => {
        let crumbs = [];
        const addTabedCrumb = (param) => {
            const rootTitle = param.toLowerCase();
            if (rootTitle === 'rules' || rootTitle === 'systems') {
                crumbs.push({ title: 'Rules', navigate: '/rules' });
            }
        };

        // add rules base breadcrumb
        if (breadcrumbs[0] !== undefined) {
            addTabedCrumb(breadcrumbs[0].title);
            crumbs.push(breadcrumbs[0]);
        } else {
            const title = match.url.split('/')[1];
            addTabedCrumb(title);
            crumbs.push({ title, navigate: `/${title}` });
        }

        // add :id breadcrumb
        if (match.params.id !== undefined && match.params.inventoryId !== undefined) {
            const title = rule.description;
            crumbs.push({
                title,
                navigate: `/${match.url.split('/')[1]}/${match.params.id}`
            });
        }

        setItems(crumbs);
    }, [breadcrumbs, match.params.id, match.params.inventoryId, match.url, rule.description]);

    useEffect(() => {
        const title = match.url.split('/')[1];
        if (match.params.inventoryId !== undefined && title !== 'systems') {
            fetchRule({ rule_id: match.params.id }); // eslint-disable-line camelcase
        } else {
            buildBreadcrumbs();
        }
    }, [buildBreadcrumbs, fetchRule, match.params.id, match.params.inventoryId, match.url]);

    useEffect(() => {
        if (ruleFetchStatus === 'fulfilled' && !ruleDescriptionLoaded) {
            setRuleDescription(true);
            buildBreadcrumbs();
        }
    }, [buildBreadcrumbs, ruleFetchStatus, ruleDescriptionLoaded]);

    return (
        <React.Fragment>
            {(ruleFetchStatus === 'fulfilled' || items.length > 0) && (
                <Breadcrumb>
                    {items.map((oneLink, key) => (
                        <BreadcrumbItem key={key}>
                            <Link to={oneLink.navigate}>{oneLink.title}</Link>
                        </BreadcrumbItem>
                    ))}
                    <BreadcrumbItem isActive>{current}</BreadcrumbItem>
                </Breadcrumb>
            )}
            {ruleFetchStatus === 'pending' && intl.formatMessage(messages.loading)}
        </React.Fragment>
    );
};

Breadcrumbs.propTypes = {
    breadcrumbs: PropTypes.arrayOf(Object),
    current: PropTypes.string,
    fetchRule: PropTypes.func,
    match: PropTypes.object,
    rule: PropTypes.object,
    ruleFetchStatus: PropTypes.string,
    intl: PropTypes.any
};

const mapStateToProps = (state, ownProps) => ({
    breadcrumbs: state.AdvisorStore.breadcrumbs,
    rule: state.AdvisorStore.rule,
    ruleFetchStatus: state.AdvisorStore.ruleFetchStatus,
    ...state,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRule: (url) => dispatch(AppActions.fetchRule(url))
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(Breadcrumbs)));
