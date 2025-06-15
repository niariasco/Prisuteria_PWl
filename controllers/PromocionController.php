<?php
class promocion
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $promo = new PromocionModel();
            $result = $promo->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function get($param)
    {
        try {
            $response = new Response();
            $promo = new PromocionModel();
            $result = $promo->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    /*
    public function getActorMovie($id)
    {
        try {
            $response = new Response();
            $promo = new PromocionModel();
            $result = $promo->get($id);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    */
}
