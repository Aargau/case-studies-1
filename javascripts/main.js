(function ($) {
    $(document).ready(function () {
        if (window.interactions) {
            window.interactions.setup();
        }

        // On mouse click and touch, add a class to <button> and <a> that removes focus rectangle
        $(document).on('mousedown touchstart', 'a, button', function () {
            $('.no-outline').removeClass('no-outline');
            $(this).addClass('no-outline');
        });

        // On keyboard navigation, remove the class that hides focus rectangle
        $(document).on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            var tabKeyCode = 9;

            if (keyCode === tabKeyCode) {
                $('.no-outline').removeClass('no-outline');
            }
        });

        // Alert stack
        (function () {
            var alertStack = $('.alert-stack');

            if (alertStack.length === 0) {
                return;
            }

            alertStack.affix({
                offset: {
                    top: alertStack.offset().top
                }
            });
        })();

        // Back to top
        (function () {
            var backToTop = $('.back-to-top'),
                threshold = 2 * $(window).height();

            // Displayed when we've scrolled 2x the viewport height
            if (backToTop.length === 0 ||
                $(document).height() < threshold) {
                return;
            }

            backToTop.affix({
                offset: {
                    top: threshold
                }
            });

            // Smooth scroll to top
            backToTop.on('click', function () {
                $('html, body').animate({
                    scrollTop: 0
                }, {
                    duration: 750,
                    easing: 'swing'
                });

                return false; // prevent default href
            });
        })();

        // Smooth scroll with page header links
        (function () {
            $('[data-scroll="smooth"] a[href*=#]:not([href=#])').on('click', function () {
                if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
                    location.hostname === this.hostname) {

                    var target = $(this.hash);
                    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

                    if (target.length) {
                        $('html, body').animate({
                            scrollTop: target.offset().top
                        }, 1500);

                        return false; // prevent default href
                    }
                }
            });
        })();


        // Forms
        (function () {
            $(".checkbox-indeterminate").prop("indeterminate", true);
        })();


        // Star rating
        (function () {
            $('.rating-btn').on('mouseenter', function () {
                var active = $(this);

                // Highlight the hovered star and the previous stars
                $(this).prevAll('.rating-btn').addClass('active');
                $(this).addClass('active');

                // Remove highlighting of the following stars
                $(this).nextAll('.rating-btn').removeClass('active');
            });

            // Remove highlight of all stars when leaving the container
            $('.rating-stars-input').on('mouseleave', function () {
                $(this).find('.rating-btn').removeClass('active');
            });
        })();

        // Share Buttons
        $('.btn-twitter').click(function(e) {
            e.preventDefault();
            window.open('http://twitter.com/share?url=' +
                encodeURIComponent(window.location.href)  + '&text=' + 
                encodeURIComponent(window.document.title) + '&count=none/', 
                'tweet', 'height=300,width=550,resizable=1')
        });

        $('.btn-facebook').click(function(e) {
            e.preventDefault();
            window.open('http://www.facebook.com/sharer.php?u=' +
                encodeURIComponent(window.location.href) + '&t=' +
                encodeURIComponent(window.document.title),
                'facebook', 'height=300,width=550,resizable=1')
        });

        $('.btn-linkedin').click(function(e) {
            e.preventDefault();

            window.open('http://www.linkedin.com/shareArticle?mini=true&url=' +
                encodeURIComponent(window.location.href) + '&title=' +
                encodeURIComponent(window.document.title),
                'LinkedIn', 'height=300,width=550,resizable=1')
        });

        $('.btn-google').click(function(e) {
            e.preventDefault();

            window.open('https://plus.google.com/share?url=' +
                encodeURIComponent(window.location.href),
                'Google', 'height=300,width=550,resizable=1')
        });

        // Tooltips
        $('[data-toggle="tooltip"]').tooltip({
            // Override Bootsrap's default template with one that does not have arrow
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>'
        });

        // Flyouts
        // Provide data-theme attribute to set flyout's color theme.
        $('[data-toggle="popover"]').each(function () {
            var $element = $(this);

            $element.popover({
                // Override Bootsrap's default template with one that does not have arrow and title
                template: '<div class="popover" role="tooltip"><div class="popover-content"></div></div>'
            }).data('bs.popover').tip().addClass($element.data("theme"));
        });

        if ($('#btn-close').length) {
            $('#btn-close').popover({
                placement: 'right',
                html: 'true',
                // Set the value of the data-theme attribute as a class name on the button.
                // That way the button will always be in the correct color theme.
                content: 'This is a flyout with a button. <button type="button" class="btn btn-primary ' + $('#btn-close').data("theme") + '"onclick="$(&quot;#btn-close&quot;).popover(&quot;hide&quot;);">Button</button>',
                template: '<div class="popover" role="tooltip"><div class="popover-content"></div></div>'
            }).data('bs.popover').tip().addClass($('#btn-close').data("theme"));
        }

        $('.post-content p').flowtype({
            minimum: 320,
            maximum: 1280,
            minFont: 14,
            maxFont: 32,
            fontRatio: 34
        });
        $('.post-content li').flowtype({
            minimum: 320,
            maximum: 1280,
            minFont: 14,
            maxFont: 32,
            fontRatio: 34
        });
        $('.post-content h3').flowtype({
            minimum: 320,
            maximum: 1280,
            minFont: 24,
            maxFont: 48,
            fontRatio: 20
        });
        $('.post-content h4').flowtype({
            minimum: 320,
            maximum: 1280,
            minFont: 24,
            maxFont: 42,
            fontRatio: 20
        });
        $('.post-content h5').flowtype({
            minimum: 320,
            maximum: 1280,
            minFont: 18,
            maxFont: 36,
            fontRatio: 25
        });
    });
}(jQuery));