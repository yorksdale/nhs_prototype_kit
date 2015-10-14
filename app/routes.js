module.exports = {
  bind : function (app) {
    function find_gp_practice(slug) {
      return app.locals.gp_practices.filter(
        function(p) {
          return p.slug === slug;
        }
      )[0];
    }

    app.get('/', function (req, res) {
      res.render('index');
    });

    app.get('/examples/template-data', function (req, res) {
      res.render('examples/template-data', { 'name' : 'Foo' });
    });

    // add your routes here

    // Change or cancel appointment fork:
    app.get('/change-or-cancel-an-appointment/path-handler', function(req, res) {
      console.log(req.query);
      if (req.query.appointment === 'change') {
        res.redirect('/change-or-cancel-an-appointment/change-to-next-available-appointment');
      } else {
        res.redirect('/change-or-cancel-an-appointment/cancel-appointment');
      }
    });

    // Register with a GP - suggested GP practices
    app.get('/register-with-a-gp/suggested-gps', function(req, res) {
      res.render(
        'register-with-a-gp/suggested-gps',
        { practices: app.locals.gp_practices }
      );
    });

    // Register with a GP - practice details
    app.get('/register-with-a-gp/practices/:practice', function(req, res) {
      var practice = find_gp_practice(req.params.practice);

      res.render('register-with-a-gp/practice-details',
                 {'practice': practice});
    });

    // Register with a GP - choose a practice to register with
    app.get('/register-with-a-gp/practices/:practice/register', function(req, res) {
      var practice = find_gp_practice(req.params.practice);

      req.session.practice = {
        name: practice.name,
        address: practice.address.join(', ')
      };

      res.redirect('/register-with-a-gp/choose-registration-method');
    });

    // Register with a GP - choose register method fork:
    app.get('/register-with-a-gp/choose-registration-method-handler', function(req, res) {
      if (req.query.registration_method === 'with-signin') {
        res.redirect('/register-with-a-gp/register-with-signin');
      } else {
        res.redirect('/register-with-a-gp/register-without-signin');
      }
    });

    // Book an appointment (with a particular pracitioner)

    app.get('/book-an-appointment/appointments-with-practitioner', function(req, res) {
      var practitioner = practitioner_details_for_slug(req.query.practitioner);

      res.render(
        'book-an-appointment/appointments-with-practitioner',
        {
          practice: app.locals.gp_practices[0],
          practitioner: practitioner,
        }
      );
    });

    app.get('/book-an-appointment/next-appointment-with-woman', function(req, res) {
      res.render(
        'book-an-appointment/next-appointment-with-woman',
        {
          practice: app.locals.gp_practices[0],
          // TODO this is a bit weird, make it better
          appointments: {
            next: app.locals.appointments[0],
            face_to_face: app.locals.appointments[3],
            female_gp: app.locals.appointments[7]
          }
        }
      );
    });

    app.get('/book-an-appointment/next-available-appointment', function(req, res) {
      res.render(
        'book-an-appointment/next-available-appointment',
        {
          practice: app.locals.gp_practices[0],
          // TODO this is a bit weird, make it better
          appointments: {
            next: app.locals.appointments[0],
            face_to_face: app.locals.appointments[3]
          }
        }
      );
    });

    app.get(/^\/(book-an-appointment\/[^.]+)$/, function (req, res) {
      var path = (req.params[0]);

      res.render(
        path,
        {
          practice: app.locals.gp_practices[0]
        },
        function(err, html) {
          if (err) {
            console.log(err);
            res.send(404);
          } else {
            res.end(html);
          }
        }
      );
    });

    // Booking with context - pass through "service" query parameter
    // ie ?service=diabetes-foot-test
    app.get('/booking-with-context/your-details', function(req, res) {
      var service = req.query.service;
      res.render('booking-with-context/your-details', {"service": service});
    });

    // Booking with context - from "service" query parameter, pass in details
    // about the session.
    app.get('/booking-with-context/next-available-appointment', function(req, res) {
      var service_context = appointment_details_for_service(req.query.service);

      res.render('booking-with-context/next-available-appointment',
                 {"service_context": service_context});
    });

    app.get('/booking-with-context/appointment-confirmed', function(req, res) {
      var service_context = appointment_details_for_service(req.query.service);

      res.render('booking-with-context/appointment-confirmed',
                 {"service_context": service_context});
    });
  }
};

function practitioner_details_for_slug(slug) {
  switch(slug) {
    case 'helen-leaf':
      return {
        name: 'Dr Helen Leaf',
        position: 'GP',
        gender: 'female',
        avatar: '/public/images/icon-avatar-helen-leaf.png'
      };
    case 'mike-johnson':
      return {
        name: 'Dr Mike Johnson',
        position: 'GP',
        gender: 'male',
        avatar: '/public/images/icon-avatar-mike-johnson.png'
      };
    case 'emma-stace':
      return {
        name: 'Dr Emma Stace',
        position: 'GP',
        gender: 'female',
        avatar: '/public/images/icon-avatar.svg'
      };
    case 'malcolm-branch':
      return {
        name: 'Dr Malcolm Branch',
        position: 'GP',
        gender: 'male',
        avatar: '/public/images/icon-avatar-malcolm-branch.png'
      };
    case 'sasheika-wrench':
      return {
        name: 'Sasheika Wrench',
        position: 'Nurse practitioner',
        gender: 'female',
        avatar: '/public/images/icon-avatar.svg'
      };
    case 'jonathon-hope':
      return {
        name: 'Jonathon Hope',
        position: 'Nurse practitioner',
        gender: 'male',
        avatar: '/public/images/icon-avatar-jonathon-hope.png'
      };
    case 'alison-wylde':
      return {
        name: 'Alison Wylde',
        position: 'Nurse',
        gender: 'female',
        avatar: '/public/images/icon-avatar-alison-wylde.png'
      };
  }
}


function appointment_details_for_service(slug) {
  switch(slug) {
    case 'diabetes-blood-glucose-test' :
      return {
        name: 'Blood sugar test',
        triage_hint: '<p>In your GP practice, blood sugar test appointments ' +
                       'are carried out by a practice nurse.</p>',
        confirmation_hint: "<p>The glycated haemoglobin (HbA1c) test gives your average blood glucose levels over the previous two to three months. The results can indicate whether the measures you're taking to control your diabetes are working.</p>" +
          "<p>Unlike other tests the HbA1c test can be carried out at any time of day and it doesn't require any special preparation, such as fasting.</p>" +
          "<p>The test will involve taking a small sample of blood from a vein.</p>",

        appointment: {
          link_url: 'appointment-confirmed?service=' + slug,
          appointment_date: 'Tuesday 26th January 2016',
          appointment_time: '16:10',
          avatar_img_path: '/public/images/icon-avatar-alison-wylde.png',
          name: 'Alison Wylde',
          position: 'Nurse',
          gender: 'female',
          appointment_length: '5',
          appointment_type: 'face to face',
          appointment_type_class: 'face-to-face',
          address: 'Lakeside Surgery<br>22 Castelnau<br>London<br>NW13 9HJ',
          tools: 'true'
        }

      };

    case 'diabetes-foot-check' :
      return {
        name: 'Diabetes foot check',
        triage_hint: '<p>In your GP practice, diabetes foot checks are carried ' +
                     'out by a practice nurse.</p>',
        confirmation_hint: "<p>People with diabetes have a much greater risk of " +
          "developing problems with their feet. It is therefore important to " +
          "have your feet examined regularly or if you have cuts or bruises.</p>" +
          "<p>You will be asked to remove " +
          "any footwear and the healthcare professional will examine your feet.</p>" +
          "<p>The charity Diabetes UK has information on <a href='https://www.diabetes.org.uk/Documents/Guide%20to%20diabetes/monitoring/What-to-expect-at-annual-foot-check.pdf'>what to expect at your annual foot check.</a>",
        appointment: {
          link_url: 'appointment-confirmed?service=' + slug,
          appointment_date: 'Tuesday 26th January 2016',
          appointment_time: '16:10',
          avatar_img_path: '/public/images/icon-avatar-alison-wylde.png',
          name: 'Alison Wylde',
          position: 'Nurse',
          gender: 'female',
          appointment_length: '20',
          appointment_type: 'face to face',
          appointment_type_class: 'face-to-face',
          address: 'Lakeside Surgery<br>22 Castelnau<br>London<br>NW13 9HJ',
          tools: 'true'
        }

      };

    case 'diabetes-eye-screening' :
      return {
        name: 'Diabetes eye screening',
        triage_hint: '<p>For your GP practice, diabetic eye screening is ' +
                     'carried out at:</p>' +
                     '<p>The Royal Hospital<br>34 Queen\'s Avenue<br>SW14 4JR</p>',
        confirmation_hint: '<p>People with diabetes are at risk of eye damage from diabetic retinopathy. Screening is a way of detecting the condition early before you notice any changes to your vision.</p>' +
          '<p>The check takes about half an hour and involves examining the back of the eyes and taking photographs of the retina.</p>' +
          '<p>If you wear glasses, bring these with you to the appointment.</p>' +
          '<p>It is also advisable to bring sunglasses with you to help on the way home. When your pupils expand, lights will become brighter.</p>' +
          '<p>The charity Diabetes UK have further <a href="http://www.diabetes.co.uk/diabetes-complications/retinopathy-screening.html">information about eye screening appointments.</a></p>',
        appointment: {
          link_url: 'appointment-confirmed?service=' + slug,
          appointment_date: 'Tuesday 26th January 2016',
          appointment_time: '16:10',
          avatar_img_path: '/public/images/icon-avatar-ravi-aggarwal.png',
          name: 'Ravi Aggarwal',
          position: 'Nurse',
          gender: 'male',
          appointment_length: '30',
          appointment_type: 'face to face',
          appointment_type_class: 'face-to-face',
          address: 'The Royal Hospital<br>34 Queen’s Avenue<br>London<br>NW13 9HJ',
          tools: 'true'
        }

      };

    case 'diabetes-annual-review' :
      return {
        name: 'Diabetes annual review',
        triage_hint: '<p>In your GP practice, diabetes annual reviews are ' +
                     'carried out by a nurse practitioner.</p>',
        confirmation_hint: '<p>Your diabetic review will allow your doctors to monitor your health and assess aspects such as your long term blood glucose control, cholesterol levels and blood pressure.</p>' +
          '<p>Because the review covers a lot of different things, it can be useful to bring a notebook and pen.</p>' +
          '<p>The charity Diabetes UK have <a href="http://www.diabetes.co.uk/nhs/diabetes-annual-care-review.html">information about the diabetes annual review.</a></p>',
        appointment: {
          link_url: 'appointment-confirmed?service=' + slug,
          appointment_date: 'Monday 25th January 2016',
          appointment_time: '11.20',
          avatar_img_path: '/public/images/icon-avatar-jonathon-hope.png',
          name: 'Jonathon Hope',
          position: 'Nurse practitioner',
          gender: 'male',
          appointment_length: '25',
          appointment_type: 'face to face',
          appointment_type_class: 'face-to-face',
          address: 'Lakeside Surgery<br>22 Castelnau<br>London<br>NW13 9HJ',
          tools: 'true'
        }

      };
  }
}
