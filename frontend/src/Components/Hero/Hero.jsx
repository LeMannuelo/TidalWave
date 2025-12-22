import ASCIIText from './ASCIIText/ASCIIText';
import './Hero.css';

const Hero = () => {
    return (
        <div className="hero">
            <ASCIIText
                text='TidalWave'
                enableWaves={true}
                asciiFontSize={7}
            />
        </div>
    );
};

export default Hero;
