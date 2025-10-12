import {Link} from 'react-router-dom'

function LinkCard({title, description, path}) {
    return (
        <Link to={path} className="uk-link-reset">
            <div className="uk-card uk-card-default uk-card-hover uk-card-body uk-transition-toggle" style={{
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
            }}>
                <div className="uk-card-badge uk-label uk-label-primary">NEW</div>
                <h3 className="uk-card-title uk-margin-small-bottom" style={{fontSize: '1.3rem'}}>
                    {title}
                </h3>
                <p className="uk-text-muted uk-margin-remove">{description}</p>
                <div className="uk-margin-small-top">
                    <span className="uk-button uk-button-text uk-text-primary">
                        바로가기
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default LinkCard
