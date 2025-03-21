import './Header.css';
import categories from './CategoriesList';

function Categories(props) {

    return (
        <div className='cat-container'>
            {categories && categories.length > 0 &&
                categories.map((item, index) => {
                    return (
                        <span 
                            onClick={() => props.handleCategory(item)} 
                            key={index} 
                            className='category'>
                            {item}
                        </span>
                    )
                })
            }
        </div>
    )
}

export default Categories;
