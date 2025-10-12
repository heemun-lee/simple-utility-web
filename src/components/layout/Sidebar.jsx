import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import UIkit from 'uikit';
import './Sidebar.css';

/**
 * Offcanvas 사이드바 컴포넌트
 * UIKit의 Offcanvas를 사용한 왼쪽 슬라이드 메뉴
 */
function Sidebar() {
    useEffect(() => {
        // UIKit Offcanvas 초기화
        const offcanvasElement = document.getElementById('offcanvas-nav');
        if (offcanvasElement) {
            UIkit.offcanvas(offcanvasElement);
        }
    }, []);

    return (
        <>
            {/* 메뉴 토글 버튼 */}
            <button
                className="uk-button uk-button-link uk-width-1-6"
                type="button"
                data-uk-toggle="target: #offcanvas-nav"
                aria-label="메뉴 열기"
            >
                <span data-uk-icon="icon: menu; ratio: 1.2"></span>
            </button>

            {/* Offcanvas 사이드바 */}
            <div id="offcanvas-nav" className="sidebar-offcanvas" data-uk-offcanvas="mode: slide; overlay: true">
                <div className="uk-offcanvas-bar uk-flex uk-flex-column">
                    {/* 닫기 버튼 */}
                    <button
                        className="uk-offcanvas-close sidebar-close-btn"
                        type="button"
                        aria-label="메뉴 닫기"
                        data-uk-toggle="target: #offcanvas-nav"
                    >
                        <span data-uk-icon="icon: close; ratio: 1.5"></span>
                    </button>

                    {/* 네비게이션 메뉴 */}
                    <nav className="sidebar-nav uk-nav-default" data-uk-nav>
                        <ul className="uk-nav">
                            {/* 홈 */}
                            <li>
                                <Link to="/" data-uk-toggle="target: #offcanvas-nav">
                                    <span data-uk-icon="icon: home"></span>
                                    <span className="uk-margin-small-left">홈</span>
                                </Link>
                            </li>

                            <li className="uk-nav-divider"></li>

                            {/* 뜨개질 도구 */}
                            <li className="uk-parent">
                                <a
                                    href="#knitting-tools"
                                    onClick={(e) => e.preventDefault()}
                                    role="button"
                                    aria-expanded="false"
                                >
                                    <span data-uk-icon="icon: grid"></span>
                                    <span className="uk-margin-small-left">뜨개질 도구</span>
                                </a>
                                <ul className="uk-nav-sub">
                                    <li>
                                        <Link
                                            to="/knitting/converter/gauge"
                                            data-uk-toggle="target: #offcanvas-nav"
                                        >
                                            게이지 변환기
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/knitting/converter/stitch"
                                            data-uk-toggle="target: #offcanvas-nav"
                                        >
                                            코 수 변환 계산기
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}

export default Sidebar;
