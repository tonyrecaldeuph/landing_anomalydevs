import { NodeNetworkContainer } from './components/NodeNetwork/NodeNetworkContainer';
import { Nav } from './components/Nav/Nav';
import { Hero } from './components/Hero/Hero';
import { Manifesto } from './components/Manifesto/Manifesto';
import { Services } from './components/Services/Services';
import { Projects } from './components/Projects/Projects';
import { Testimonials } from './components/Testimonials/Testimonials';
import { Contact } from './components/Contact/Contact';
import { Footer } from './components/Footer/Footer';

export default function App() {
  return (
    <>
      <NodeNetworkContainer />
      <Nav />
      <Hero />
      <Manifesto />
      <Services />
      <Projects />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
