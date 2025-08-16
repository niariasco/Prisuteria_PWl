import Slider from 'react-slick';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Info, AccountCircle } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

ListaCartasResenas.propTypes = {
  data: PropTypes.array.isRequired
};

export function ListaCartasResenas({ data }) {

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    responsive: [
      { breakpoint: 960, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <Slider {...settings}>
      {data && data.map((resena) => (
        <Box key={resena.resenasId} sx={{ px: 1 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: 6,
            background: 'linear-gradient(145deg, #ffffff, #fff0f5)',
          }}>
            <CardHeader
              avatar={<AccountCircle sx={{ fontSize: 40, color: '#f06292' }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f06292' }}>
                  {resena.nombre_usuario}
                </Typography>
              }
              sx={{
                background: 'linear-gradient(135deg, #f8bbd0, #ffc1e3)',
                color: '#fff',
                textAlign: 'center',
                py: 2,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16
              }}
            />
            <CardContent sx={{ minHeight: 230 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d83b6a', mb: 0.5 }}>
                Producto:
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {resena.nombre}
              </Typography>

              <Divider sx={{ my: 1, borderColor: '#f8bbd0' }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d83b6a', mb: 0.5 }}>
                Comentario:
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontStyle: 'italic' }}>
               {resena.comentario}
              </Typography>

              <Divider sx={{ my: 1, borderColor: '#f8bbd0' }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d83b6a', mb: 0.5 }}>
                Valoración:
              </Typography>
              <Rating value={resena.calificacion || 0} max={5} precision={0.5} readOnly sx={{ color: '#f06292' }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <IconButton
                  component={Link}
                  to={`/resena/${resena.resenasId}`}
                  aria-label="Detalle"
                  sx={{
                    color: '#fff',
                    backgroundColor: '#f06292',
                    borderRadius: 2,
                  }}
                >
                  <Info />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Slider>
  );
}