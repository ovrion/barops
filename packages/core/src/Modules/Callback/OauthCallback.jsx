import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const OauthCallback = () => {
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokens = {};

        // token, token1, token2, token3 등 모든 토큰 파라미터 받아서 저장 (예시 간단화)
        ['token', 'token1', 'token2', 'token3'].forEach(key => {
            const val = params.get(key);
            if (val) tokens[key] = val;
        });

        if (Object.keys(tokens).length > 0) {
            // 로컬스토리지에 저장 (여기에 실계정, 데모 계정 등 분리 로직 필요시 추가)
            localStorage.setItem('derivTokens', JSON.stringify(tokens));
            // 로그인 후 이동할 경로 (traders_hub 등)
            history.replace('/traders-hub');
        } else {
            // 토큰 없으면 로그인 페이지로 리다이렉트
            history.replace('/login');
        }
    }, [history]);

    return <div>로그인 처리 중입니다...</div>;
};

export default OauthCallback;
