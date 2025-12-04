import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createClient } from '../lib/supabase/clients';
import { toast } from 'react-hot-toast';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      
      // Create client in CRM
      await createClient({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        status: 'nuevo'
      });
      
      toast.success('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
      reset();
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Ocurrió un error al enviar tu mensaje. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gradient-to-b from-secondary-50 via-white to-secondary-50 main-content">
        <div className="container mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="mb-10 text-center pt-12">
            <h1 className="font-heading font-bold text-4xl mb-6 text-secondary-900">
              Contáctanos
            </h1>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Estamos aquí para ayudarte a planificar tu próximo viaje. No dudes en contactarnos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white via-white to-secondary-50 rounded-lg shadow-card p-8">
                <h2 className="font-heading font-bold text-2xl mb-6 text-secondary-900">
                  Envíanos un mensaje
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nombre completo"
                      id="name"
                      type="text"
                      placeholder="Juan Pérez"
                      fullWidth
                      error={errors.name?.message}
                      {...register('name', { required: 'El nombre es obligatorio' })}
                    />
                    
                    <Input
                      label="Correo electrónico"
                      id="email"
                      type="email"
                      placeholder="juan@ejemplo.com"
                      fullWidth
                      error={errors.email?.message}
                      {...register('email', { 
                        required: 'El correo es obligatorio',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Correo electrónico inválido',
                        },
                      })}
                    />
                  </div>
                  
                  <Input
                    label="Teléfono"
                    id="phone"
                    type="tel"
                    placeholder="099 123 456"
                    fullWidth
                    error={errors.phone?.message}
                    {...register('phone', { required: 'El teléfono es obligatorio' })}
                  />
                  
                  <Textarea
                    label="Mensaje"
                    id="message"
                    placeholder="¿En qué podemos ayudarte?"
                    rows={5}
                    fullWidth
                    error={errors.message?.message}
                    {...register('message', { required: 'El mensaje es obligatorio' })}
                  />
                  
                  <div className="mt-6">
                    <Button type="submit" isLoading={isSubmitting}>
                      Enviar mensaje
                    </Button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <div className="bg-gradient-to-br from-white via-secondary-50 to-primary-50 rounded-lg shadow-card p-8">
                <h2 className="font-heading font-bold text-2xl mb-6 text-secondary-900">
                  Información de contacto
                </h2>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="mr-4">
                      <div className="bg-primary-100 rounded-full p-3">
                        <MapPin className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-lg text-secondary-900 mb-1">
                        Dirección
                      </h3>
                      <p className="text-secondary-600">
                        18 de Julio 1236<br />
                        11100 Montevideo, Uruguay
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-4">
                      <div className="bg-primary-100 rounded-full p-3">
                        <Phone className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-lg text-secondary-900 mb-1">
                        Teléfono
                      </h3>
                      <p className="text-secondary-600">
                       091 339 099
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-4">
                      <div className="bg-primary-100 rounded-full p-3">
                        <Mail className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-lg text-secondary-900 mb-1">
                        Correo electrónico
                      </h3>
                      <p className="text-secondary-600">
                        info@vipturismo.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-4">
                      <div className="bg-primary-100 rounded-full p-3">
                        <Clock className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-lg text-secondary-900 mb-1">
                        Horario de atención
                      </h3>
                      <p className="text-secondary-600">
                        Lunes a Viernes: 10:00 - 18:00<br />
                        Sábados: 9:30 - 13:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Map Section */}
        <div className="w-full bg-gradient-to-b from-white to-secondary-50">
          <div className="container mx-auto px-4 py-8">
            <h2 className="font-heading font-bold text-2xl text-center text-secondary-900 mb-2">
              Nuestra Ubicación
            </h2>
            <p className="text-center text-secondary-600 mb-6">
              Visítanos en nuestras oficinas en el corazón de Montevideo
            </p>
          </div>
          
          {/* Responsive Map Container */}
          <div className="w-full">
            <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.9592486761903!2d-56.18651592348943!3d-34.90679257293424!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81cb6a6d5a2b%3A0x6f59787d31ca4e49!2s18%20de%20Julio%201236%2C%2011100%20Montevideo%2C%20Departamento%20de%20Montevideo%2C%20Uruguay!5e0!3m2!1ses!2sus!4v1700533222777!5m2!1ses!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}