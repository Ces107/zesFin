package ces107.zesFin.views;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;

/**
 * Vista principal de la aplicación ZesFin.
 * Se vincula a la ruta raíz ("") de la navegación web.
 */
@Route("")
public class MainView extends VerticalLayout {

    public MainView() {
        // Crear componente de título (encabezado) con el nombre de la aplicación
        H1 titulo = new H1("ZesFin - Gestión Financiera");

        // Crear botón sencillo
        Button boton = new Button("Haz clic aquí");

        // Añadir listener al botón para mostrar notificación flotante al hacer clic
        boton.addClickListener(event -> 
            Notification.show("¡Botón presionado! Bienvenido a ZesFin")
        );

        // Añadir ambos componentes al diseño
        add(titulo, boton);
    }
}
