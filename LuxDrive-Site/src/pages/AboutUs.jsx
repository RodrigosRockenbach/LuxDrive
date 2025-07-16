import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import logo from '../assets/images/LogoAzul.png';
import '../styles/AboutUs.css';

export default function AboutUs() {
  return (
    <Container className="about-page py-5">
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={6} className="text-center">
          <img src={logo} alt="LuxDrive Logo" className="about-logo mb-3" />
          <h2 className="fw-bold">Sobre a LuxDrive</h2>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          <Card className="p-4 shadow-sm">
            <Card.Body>
              <p>
                A LuxDrive nasceu em 2025 a partir do desejo de revolucionar a forma como as pessoas agendam serviços automotivos, combinando soluções tecnológicas com atenção impecável aos detalhes. Desde o primeiro momento, como meta criar uma plataforma intuitiva, capaz de conectar proprietários de veículos a empresas de lavagem automotivas de maneira rápida e segura.
              </p>

              <p>
                Nossa missão é oferecer conveniência e qualidade, simplificando todo o processo de agendamento: do primeiro clique até a confirmação do serviço. Através da LuxDrive, o usuário encontra diversas opções de lavagem em um único lugar, escolhe a lavagem, serviços  e reserva o horário que melhor se encaixa em sua rotina.
              </p>

              <p>
                Hoje, nosso foco é ampliar nossa atuação em todo o Brasil, elevando o padrão de excelência no segmento automotivo. Queremos ser referência nacional em agendamentos online, antecipando necessidades e oferecendo soluções inovadoras.
              </p>

              <p className="text-muted fst-italic">
                LuxDrive &copy; {new Date().getFullYear()}. Todos os direitos reservados.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
