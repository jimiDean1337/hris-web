import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
// import Swiper core and required modules

import * as Aos from 'aos';

@Component({
  selector: 'hris-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'hris-web';

  formModel: any = {};

  formAlert: any = {
    show: false,
    title: 'Way to go!',
    text: '',
  }

  constructor(private afs: AngularFirestore) { }

  async addContact(name: string, email: string, subject: string, msg: string, form: any) {
    const data: any = {
      name,
      email,
      subject,
      msg,
      timestamp: new Date()
    };

    await this.afs.collection('contacts').add(data);
    return this.toggleFormAlert(true, 'Nice! You message has been sent!', form)
  }

  async addSubscriber(email: string, form: any) {
    const data: any = {
      email,
      timestamp: new Date()
    };

    await this.afs.collection('subscribers').add(data);
    return this.toggleFormAlert(true, 'Oh Yeah! You are now subscribed!', form)
  }

  alertClosed() {
    this.formModel = {};
    this.formAlert = {
      show: false,
      title: '',
      text: '',
    };
  }

  getCollection(name: string) {
    return this.afs.collection(name).valueChanges();
  }

  ngOnInit() {

    Aos.init({
      useClassNames: true,
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })


    /**
     * Easy selector helper function
     */
    const select = (el: any, all: boolean = false): NodeListOf<any> | any => {
      // console.log('Selected Element', el)
      el = el.trim()
      if (all) {
        return document.querySelectorAll(el)
      } else {
        return document.querySelector(el)
      }
    }

    /**
    * Easy event listener function
    */
    const on = (type: string, el: string | HTMLElement, listener: any, all = false) => {
      let selectEl: any = select(el, all);
      if (selectEl) {
        if (all) {
          selectEl.forEach((e: any) => (e: EventSource) => e.addEventListener(type, listener))
        } else {
          selectEl.addEventListener(type, listener)
        }
      }
    }

    /**
      * Easy on scroll event listener
      */
    const onscroll = (el: any, listener: any) => {
      el.addEventListener('scroll', listener)
    }

    /**
      * Navbar links active state on scroll
      */
    let navbarlinks = select('#navbar a.scrollto', true);
    console.log('Links', navbarlinks)
    const navbarlinksActive = () => {
      let position = window.scrollY + 200;
      navbarlinks.forEach((navbarlink: any) => {
        if (!navbarlink.hash) return;
        let section: HTMLElement = select(navbarlink.hash);
        if (!section) return;
        if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
          navbarlink.classList.add('active');
        } else {
          navbarlink.classList.remove('active');
        }
      })
    }
    window.addEventListener('load', navbarlinksActive)
    onscroll(document, navbarlinksActive)

    /**
      * Scrolls to an element with header offset
      */
    const scrollto = (el) => {
      let header = select('#header')
      let offset = header.offsetHeight

      let elementPos = select(el).offsetTop
      window.scrollTo({
        top: elementPos - offset,
        behavior: 'smooth'
      })
    }

    /**
      * Header fixed top on scroll
      */
    let selectHeader = select('#header')
    if (selectHeader) {
      let headerOffset = selectHeader.offsetTop
      let nextElement = selectHeader.nextElementSibling
      const headerFixed = () => {
        if ((headerOffset - window.scrollY) <= 0) {
          selectHeader.classList.add('fixed-top')
          nextElement.classList.add('scrolled-offset')
        } else {
          selectHeader.classList.remove('fixed-top')
          nextElement.classList.remove('scrolled-offset')
        }
      }
      window.addEventListener('load', headerFixed)
      onscroll(document, headerFixed)
    }

    /**
      * Back to top button
      */
    let backtotop = select('.back-to-top')
    if (backtotop) {
      const toggleBacktotop = () => {
        if (window.scrollY > 100) {
          backtotop.classList.add('active')
        } else {
          backtotop.classList.remove('active')
        }
      }
      window.addEventListener('load', toggleBacktotop)
      onscroll(document, toggleBacktotop)
    }


      // Mobile nav toggle
     on('click', '.mobile-nav-toggle', function (e) {
       select('#navbar').classList.toggle('navbar-mobile')
       this.classList.toggle('bi-list')
       this.classList.toggle('bi-x')
     })


    /**
      * Mobile nav dropdowns activate
     on('click', '.navbar .dropdown > a', function (e: any) {
       if (select('#navbar').classList.contains('navbar-mobile')) {
         e.preventDefault()
         this.nextElementSibling.classList.toggle('dropdown-active')
       }
     }, true)
      */

    /**
      * Scroll with ofset on links with a class name .scrollto
      */
    on('click', '.scrollto', function (e) {
      if (select(this.hash)) {
        // console.log(this.hash)
        e.preventDefault()

        let navbar = select('#navbar')
        if (navbar.classList.contains('navbar-mobile')) {
          navbar.classList.remove('navbar-mobile')
          let navbarToggle = select('.mobile-nav-toggle')
          navbarToggle.classList.toggle('bi-list')
          navbarToggle.classList.toggle('bi-x')
        }
        scrollto(this.hash)
      }
    }, true)

    /**
      * Scroll with ofset on page load with hash links in the url
      */
    window.addEventListener('load', () => {
      if (window.location.hash) {
        if (select(window.location.hash)) {
          scrollto(window.location.hash)
        }
      }
    });

  }

  private toggleFormAlert(show: boolean, title: string, form: any, text?: string) {
    form.reset();
    this.formAlert.show = true;
    this.formAlert.title = title;
    this.formAlert.text = text || '';
  }
}
