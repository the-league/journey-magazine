(function ($) {

    $.saveimages = function (element, options) {

        var defaults = {
            handler: 'saveimage.php',
            onComplete: function () { }
        };

        this.settings = {};

        var $element = $(element),
                element = element;

        this.init = function () {

            this.settings = $.extend({}, defaults, options);

        };

        this.save = function (s) {

            var handler = this.settings.handler;

            //Get quality info (from content builder plugin)
            var hiquality = true;
            try {
                hiquality = $element.data('contentbuilder').settings.hiquality;
            } catch (e) { };

            var count = 0;

            //Check all images
            $element.find('img').each(function () {

                //Find base64 images
                if ($(this).attr('src').indexOf('base64') != -1) {

                    count++;

                    //Read image (base64 string)
                    var image = $(this).attr('src');
                    image = image.replace(/^data:image\/(png|jpeg);base64,/, "");

                    //Prepare form to submit image
                    if ($('#form' + count).length == 0) {
                        var s = '<form id="form-' + count + '" target="frame-' + count + '" method="post" enctype="multipart/form-data">' +
                        '<input id="hidimg-' + count + '" name="hidimg-' + count + '" type="hidden" />' +
                        '<input id="hidname-' + count + '" name="hidname-' + count + '" type="hidden" />' +
                        '<input id="hidtype-' + count + '" name="hidtype-' + count + '" type="hidden" />' +
                        '<iframe id="frame-' + count + '" name="frame-' + count + '" style="width:1px;height:1px;border:none;visibility:hidden;position:absolute"></iframe>' +
                    '</form>';
                        $('body').append(s);
                    }

                    //Give ID to image
                    $(this).attr('id', 'img-' + count);

                    //Set hidden field with image (base64 string) to be submitted
                    $('#hidimg-' + count).val(image);

                    //Set hidden field with file name to be submitted
                    var filename = '';
                    if ($(this).data('filename') != undefined) {
                        filename = $(this).data('filename'); //get filename data from the imagemebed plugin
                    }
                    var filename_without_ext = filename.substr(0, filename.lastIndexOf('.')) || filename;
                    filename_without_ext = filename_without_ext.toLowerCase().replace(/ /g, '-');
                    $('#hidname-' + count).val(filename_without_ext);

                    //Set hidden field with file extension to be submitted
                    if (hiquality) {
                        //If high quality is set true, set image as png
                        $('#hidtype-' + count).val('png'); //high quality
                    } else {
                        //If high quality is set false, depend on image extension
                        var extension = filename.substr((filename.lastIndexOf('.') + 1));
                        extension = extension.toLowerCase();
                        if (extension == 'jpg' || extension == 'jpeg') {
                            $('#hidtype-' + count).val('jpg');
                        } else {
                            $('#hidtype-' + count).val('png');
                        }
                    }

                    //Submit form
                    $('#form-' + count).attr('action', handler + '?count=' + count);
                    $('#form-' + count).submit();

                    //Note: the submitted image will be saved on the server 
                    //by saveimage.php (if using PHP) or saveimage.ashx (if using .NET)
                    //and the image src will be changed with the new saved image.
                }
            });

            //Check per 2 sec if all images have been changed with the new saved images.
            var int = setInterval(function () {

                var finished = true;
                $element.find('img').each(function () {
                    if ($(this).attr('src').indexOf('base64') != -1) { //if there is still base64 image, means not yet finished.
                        finished = false;
                    }
                });

                if (finished) {

                    $element.data('saveimages').settings.onComplete();

                    window.clearInterval(int);

                    //remove unused forms (previously used for submitting images)
                    for (var i = 1; i <= count; i++) {
                        $('#form-' + i).remove();
                    }
                }
            }, 2000);

        };

        this.init();

    };

    $.fn.saveimages = function (options) {

        return this.each(function () {

            if (undefined == $(this).data('saveimages')) {
                var plugin = new $.saveimages(this, options);
                $(this).data('saveimages', plugin);

            }

        });
    };
})(jQuery);