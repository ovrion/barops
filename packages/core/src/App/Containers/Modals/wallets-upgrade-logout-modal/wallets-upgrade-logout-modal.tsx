import React from 'react';
import Cookies from 'js-cookie';

import { Dialog, Icon, Text } from '@deriv/components';
import { useOauth2, useTMB } from '@deriv/hooks';
import { redirectToLogin } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { getLanguage, Localize, localize } from '@deriv/translations';
import { Analytics, TEvents } from '@deriv-com/analytics';
import { requestOidcAuthentication } from '@deriv-com/auth-client';

import './wallets-upgrade-logout-modal.scss';

const trackAnalyticsEvent = (
    action: TEvents['ce_tradershub_popup']['action'],
    account_mode: TEvents['ce_tradershub_popup']['account_mode']
) => {
    Analytics.trackEvent('ce_tradershub_popup', {
        action,
        form_name: 'ce_tradershub_popup',
        account_mode,
        popup_name: 'almost_there_wallets_step_3_1',
        popup_type: 'with_cta',
    });
};

const WalletsUpgradeLogoutModal = observer(() => {
    const { client, ui } = useStore();
    const { is_virtual, logout, setShouldRedirectToLogin } = client;
    const { is_desktop } = ui;
    const account_mode = is_virtual ? 'demo' : 'real';
    const is_deriv_com = /deriv\.(com)/.test(window.location.hostname) || /localhost:8443/.test(window.location.host);
    const { isTmbEnabled } = useTMB();
    const { oAuthLogout } = useOauth2({
        handleLogout: async () => {
            await logout();
            const is_tmb_enabled = await isTmbEnabled();
            if (is_deriv_com && !is_tmb_enabled) {
                try {
                    await requestOidcAuthentication({
                        redirectCallbackUri: `${window.location.origin}/callback`,
                    }).catch(err => {
                        // eslint-disable-next-line no-console
                        console.error(err);
                    });
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                }
            }
            if (is_tmb_enabled) {
                setShouldRedirectToLogin(true);
            }
        },
    });

    React.useEffect(() => {
        trackAnalyticsEvent('open', account_mode);
    }, [account_mode]);

    const onConfirmHandler = async () => {
        Cookies.set('recent_wallets_migration', 'true', {
            path: '/', // not available on other subdomains
            expires: 0.5, // 12 hours expiration time
            secure: true,
        });
        await oAuthLogout();
        trackAnalyticsEvent('click_cta', account_mode);
    };

    return (
        <Dialog
            className='wallets-upgrade-logout-modal'
            confirm_button_text={localize('Log out')}
            onConfirm={onConfirmHandler}
            is_closed_on_confirm
            is_visible
            dismissable={false}
            has_close_icon={false}
        >
            <Icon className='wallets-upgrade-logout-modal__pic' icon='IcWalletUpgradeLogout' />
            <div className='wallets-upgrade-logout-modal__content'>
                <Localize
                    i18n_default_text="<0>You're almost there!</0>"
                    components={[<Text key={0} weight='bold' size={is_desktop ? 'm' : 's'} />]}
                />
                <Localize
                    i18n_default_text='<0>To complete your Wallet setup, log out and then log in again.</0>'
                    components={[
                        <Text align={is_desktop ? 'left' : 'center'} key={0} size={is_desktop ? 's' : 'xxs'} />,
                    ]}
                />
            </div>
        </Dialog>
    );
});

export default WalletsUpgradeLogoutModal;
